---
title: "The Ark Protocol: Forfeit Transactions and Connector Trees"
summary: "How leaving and refreshing a VTXO are made atomic and trustless"
date: 2026-08-18
ShowToc: true
cover:
    image: "/ark/cover.png"
---

# Forfeit Transactions and Connector Trees

There are a few actions a VTXO owner might want to take that also involve
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

In the second scenario where the user has forfeited the VTXO A but the new batch
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

![](/ark/why-connector-tree.png#center)

Which means a batch transaction ends up carrying two trees. The batch output pays
to the VTXT holding everyone's new VTXOs, and the connector output pays to the
connector tree holding the connectors for everyone's forfeits. Same construction,
two very different jobs.

![](/ark/batch-anatomy.png#center)

It is worth stressing that the sizes of these two trees have nothing to do with
each other. The VTXT has one leaf per new VTXO being created in this batch, and
the connector tree has one leaf per forfeit being processed. Those are different
users doing different things, so there is no reason at all for the two counts to
match. A batch might have no forfeits in it (everyone is boarding fresh funds)
and so no connector tree, or no new VTXOs (everyone is leaving) and so no VTXT.
And the VTXOs being forfeited will generally be scattered across many different
older batches: the chances of every VTXO in one tree being refreshed at the same
time are slim, and nothing about the protocol requires it.

Let's make that concrete. Say four users have each requested a forfeit in this
batch. The operator builds them a connector tree with one leaf apiece:

![](/ark/connector-tree.png#center)

Every output in that tree is a plain dust output paying to the operator's key,
<code>P<sub>o</sub></code>. That is the whole script. There is no sweep path and no
timelock, because there is nothing here to protect against. The operator owns
every output in this tree, from the root all the way down to the leaves, so there
is nobody to race and nothing to reclaim.

Just as with the VTXT, these diagrams leave one thing out. Every virtual
transaction in the connector tree also carries a zero-value ephemeral anchor
output. These transactions are all built with zero fees, so that anchor is how
the operator attaches a fee via CPFP if it ever does need to get them confirmed
on-chain.

The amounts are worth a word too. A connector carries no real value. Its only job
is to be the second input of a forfeit transaction, so that the forfeit is
worthless until the batch transaction is on-chain. So each leaf is a dust output,
the smallest amount the network will relay, and the connector output on the batch
transaction has to hold enough to fund all of the leaves below it: four forfeits,
four times dust. A connector tree therefore costs the operator a small, fixed
amount per forfeit.

That money is not gone, though. The connector output pays straight to the
operator's own key, so it can sweep the whole thing back whenever it likes, and
it will do exactly that once the amount sitting there has grown enough to be
worth the transaction fee to collect.

Notice too that the connector tree does not have to use the same radix as the
VTXT. The two trees are built for different reasons and sized by different things,
so the operator is free to pick whatever shape suits the number of forfeits it is
processing in this batch.

Now, each of those four users only needs one leaf. So the operator hands each of
them the chain of virtual transactions running from the batch transaction down to
their own connector, and nothing more. For the first of them that is `ctx`, then
`con5`, then `con1`:

![](/ark/connector-unrolled.png#center)

That chain is what proves to the user that their connector really does descend
from this batch transaction. It is also exactly what gets broadcast if the
connector ever does need to go on-chain.

And now that user can build their forfeit transaction. It takes two inputs:
`vtx_a:0`, the VTXO they are giving up, spent via its collaborative path, and
`con1:0`, the connector leaf they were just handed. Its single output pays the
value of the old VTXO across to the operator.

![](/ark/forfeit-tx-structure.png#center)

## Leave Requests

Everything above used a Batch Swap as the example, but a leave request works in
exactly the same way. The only thing that changes is what the operator puts in the
new batch transaction for you.

In a Batch Swap you are given a fresh VTXO as a leaf of the new VTXT. In a leave
request you are given a plain output on the batch transaction itself, paying you
on-chain, and there is no restriction on the script you ask it to pay to.

Everything else is untouched. You still forfeit your old VTXO, the forfeit
transaction still spends that VTXO together with a connector leaf from the new
batch transaction, and the same atomicity holds: if the batch transaction
confirms then your coins are on-chain and the operator can claim the old VTXO,
and if it never confirms then your old VTXO is still yours.

[litepaper]: https://docs.arklabs.xyz/ark.pdf
[arkade]: https://github.com/lightninglabs/ark
