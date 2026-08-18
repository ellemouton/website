---
title: "The Ark Protocol: Part 1"
summary: "Virtual Transaction Trees, Batch Transactions, Forfeits and Connectors"
date: 2026-08-18
ShowToc: true
aliases:
  - /ark-part-1
---

<!--
Images: drop in static/ark/, reference as ![](/ark/<name>.png#center)
Link refs at the bottom, [ref]: ../../posts/<slug> style.
-->

# Forfeit Transactions and Connector Trees

There are a few actions a VTXO owner might want to take that also involves
participating in a round.

- **Leaving the Ark**

  This involves the exchange of VTXO(s) for UTXO(s). In other words, a user gives
  up (forfeits) a VTXO or set of VTXOs in exchange for a normal UTXO or set of
  UTXOs which will be normal outputs of a Batch transaction.

  ![](/ark/leaving-the-ark.png#center)

- **Refreshing a VTXO (Batch Swap)**

  As we've seen, a batch output paying to a VTXT has an expiry. Once the expiry is
  reached, the operator will be able to sweep all the funds of the output
  unilaterally and so participants with live VTXOs rooted in that tree will want to
  make sure they retain access to their VTXOs. They do so by performing a Batch
  Swap which involves giving up (forfeiting) ownership of their older VTXO in
  exchange for a new one in a new Batch.

  ![](/ark/refreshing-a-vtxo.png#center)

As you can see, both of these actions involve forfeiting a VTXO in exchange for
some promise in a new Batch transaction (either a UTXO or a new VTXO). This
process of forfeiting is quite involved and so we will dive into this process
now. By the end of the explanation, you should understand what a forfeit
transaction is along with what the purpose of a connector tree is and how the two
in combination make the leave/refresh flows atomic and trust-less.

## Batch Swap Example

### Setting the scene

I'll use a Batch Swap example in order to demonstrate the forfeit process. In a
Batch Swap, a user wants to exchange their existing VTXO for a fresh VTXO in a
new Batch. So we have the current situation:

- A valid VTXO A in an existing, confirmed batch (batch 1)
- A new VTXO B in a new batch under construction (batch 100)

![](/ark/batch-swap-setup.png#center)

### The outcome we _do_ want

We want the outcome of the process to be the following:

- The VTXO A should be invalidated/forfeit and no longer useable by the owner.
  The owner should not be able to claim that VTXO on-chain by unilaterally
  exiting anymore.
- The VTXO B should be in the new confirmed batch and useable by the owner.

![](/ark/batch-swap-desired-outcome.png#center)

### What we _don't_ want as the Ark Operator

As the Ark Operator, we want to avoid the situation where the user ends up with
two valid VTXOs where they can successfully unilaterally exit both VTXOs without
any consequences.

![](/ark/batch-swap-operator-risk.png#center)

### What we _don't_ want as the user

As the user, we want to avoid the situation where the old VTXO A has been forfeit
but the new batch with VTXO B never gets confirmed and so the user no longer has
ownership of any live VTXO.

![](/ark/batch-swap-user-risk.png#center)

In other words, we need these two events to be atomic such that:

```
IF the new batch gets confirmed:
    THEN the old VTXO is forfeit and the new VTXO is active
ELSE IF the new batch is aborted:
    THEN the old VTXO remains valid
```

Enter Forfeit Transactions and Connector Outputs!

## Connector Outputs

A forfeit transaction is a transaction that collaboratively spends a VTXO and
sends the full value of the VTXO to the operator. The way that we make this
atomic such that we satisfy all the conditions above is that we make this forfeit
transaction not only spend from the VTXO in question but _also_ from the new
batch transaction. In other words we make it such that the forfeit transaction is
meaningless/invalid if the new batch transaction never makes it on-chain since
then one of the forfeit transaction's inputs is invalid.

![](/ark/forfeit-tx-with-connector.png#center)

Let's run through those two examples from before again to see how this new
construction saves both the user and operator.

In the first case where the user tries to unroll the forfeited VTXO A when the
new VTXO B has already been activated in confirmed batch 100, the operator can
just "correct" the state by broadcasting the forfeit transaction that the user
would have signed which will sweep the funds giving the operator access to those
funds and leaving the user purely with the value of the new VTXO B.

![](/ark/forfeit-operator-claims.png#center)

In the second scenario where the user has forfeit the VTXO A but the new batch
never makes it on-chain, the user continues to have full access to the VTXO since
the forfeit transaction is meaningless without batch 100 being on-chain.

![](/ark/forfeit-without-batch.png#center)

## Connector Trees

Turns out, the virtual transaction tree construction has more use than just
embedding VTXOs! The connector outputs are a necessary thing to have for the
security model but in the vast majority of cases, we don't really ever expect
them to be required (it is more their presence that is important) and so it is
wasteful to have an explicit connector output on the batch transaction for every
forfeit occurring. Luckily, we can re-use the VTXT construction to house these
outputs! The only difference between the connector tree and the VTXO virtual tree
is that all the outputs are fully owned by the operator.


[litepaper]: https://docs.arklabs.xyz/ark.pdf
[arkade]: https://github.com/lightninglabs/ark
