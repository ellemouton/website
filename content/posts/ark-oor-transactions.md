---
title: "The Ark Protocol: OOR Transactions"
summary: "Paying inside an Ark without waiting for a batch transaction, and what it costs"
date: 2026-08-22
cover:
  image: "/ark/cover-oor.png"
ShowToc: true
---

# OOR Transactions

<div style="border:1px solid var(--border);border-radius:var(--radius);padding:1rem 1.25rem;margin:1.5rem 0;background:var(--entry);">
<strong>The Ark series</strong>
<ol style="margin:0.6rem 0 0;padding-left:1.3rem;line-height:1.6;">
<li><a href="../../posts/ark-vtxos-and-trees" target="_blank" rel="noopener noreferrer"><strong>VTXOs and the Virtual Transaction Tree</strong></a><br>The why, plus the Virtual Transaction Tree and Batch transaction concepts.</li>
<li><a href="../../posts/ark-forfeits-and-connectors" target="_blank" rel="noopener noreferrer"><strong>Forfeit Transactions and Connector Trees</strong></a><br>How you leave the Ark or keep a VTXO alive.</li>
<li><strong>Out-of-Round Transactions</strong> &nbsp;<em>(you are here)</em><br>Also called OOR transactions or Ark transactions, along with Checkpoint transactions.</li>
</ol>
</div>

We've covered how to establish a VTXO in an Ark, how to leave the Ark and how to
keep the VTXO alive by performing a Batch Swap. All of these require a round
interaction meaning that the user has to join a round and wait for the resulting
batch transaction to be confirmed. In other words, everything we've described is
"in-round". By itself, in-round operations are not very useful. What makes Ark
useful is the ability to have _out of round (or OOR)_ transactions. These are
transactions that spend VTXOs and create new VTXOs without a new round/batch being
required. OOR transactions are also sometimes referred to as Ark transactions. OOR
transactions allow VTXO owners to use their VTXOs just like they would their
on-chain UTXOs but without worrying about fees and confirmations. In this article,
we dive into how the OOR process works and what the various trust assumptions are.
We will also cover what checkpoint transactions are and why they are needed.

Some useful vocabulary to know before we jump in: a VTXO that is derived in a round
and is the leaf of a VTX tree is either an **in-round VTXO** or a **confirmed
VTXO**. A VTXO that is derived via an OOR/Ark transaction is called an **OOR VTXO**
or **pre-confirmed VTXO**. The terms confirmed and pre-confirmed will make more
sense as we go through the trust assumptions of these VTXOs.

## OOR Examples

First, I'd like to present some visuals to give an intuition of what OOR
transactions look like. Note that these are simplified examples that will help us
understand why we need to introduce checkpoint transactions later on.

At its core, an OOR is just about taking a VTXO (or set of VTXOs) and creating a
new VTXO (or set of VTXOs), _just like a normal bitcoin transaction_ (since all
transactions in Ark can go on-chain if required). These first two diagrams show a
round-born VTXO (a VTXO that is a leaf of a VTXT) being spent by an Ark transaction
to create two new VTXOs.

![](/ark/oor-simple-spend.png#center)

There is technically no limit to how deep this chain goes, so here we have another
Ark transaction that spends the two new VTXOs and creates yet another one.

![](/ark/oor-chain.png#center)

There is also nothing stopping us from spending two VTXOs that are rooted in
different VTX trees, they are all part of the same VTXO-set. So the following
scenario is also something we'd want to support:

![](/ark/oor-across-batches.png#center)

## The transaction details

Ark/OOR transactions are done in collaboration with the operator and so they spend
a VTXO along the collaborative path (ie, there is no timelock on the spend) and
create new VTXO(s) with the same structure. Signatures from both the VTXO owner and
the operator are required in order to produce a valid Ark transaction.

![](/ark/oor-tx-details.png#center)

## A few important questions

Ok cool, now that we've seen some of the scenarios we'd like to support, let's take
a second to answer a few important questions.

### What data do I need to keep?

If you own a round-born VTXO (ie, a leaf of a VTXT), you must have all the
transactions in the tree path that lead from the batch transaction to your VTXO.
You will already have all this data after completing the round negotiation flow.
If, however, you receive an OOR derived VTXO, you will need to make sure to fetch
the path from the batch to your new VTXO which includes any Ark transactions
between the leaf VTXO(s) and your VTXO. If your VTXO has multiple batch
transactions in its lineage, you'll need to account for that too. Note that the
deeper the OOR lineage chain is, the more transactions you will need to get
confirmed on-chain in order to unroll and you would need to cover the fees for
those confirmations which can get expensive quite quickly.

![](/ark/oor-deep-lineage.png#center)

### What should I watch on-chain?

If you own a round-born VTXO, you are in the safest position as long as you
remember to refresh your VTXO before the batch expires. Even if someone else
broadcasts your VTXO's lineage on-chain, your funds are not at risk and you will
still have the final word since you can unilaterally spend your VTXO when it goes
on-chain without the risk of someone else spending it. Once you spend this VTXO,
you also no longer need to watch any outputs for it. However, if you have received
an OOR VTXO, the story changes quite a bit and you are no longer in as much of a
secure situation. If you've received such a VTXO, you must always monitor the chain
carefully in case the owner of any parent VTXO of your VTXO tries to unroll. If
they do and you don't react, they will be able to steal those funds via the timeout
path. But if you do notice they go on-chain, all you need to do is to "correct" the
state by broadcasting the Ark transaction that spends from their VTXO which will
not be timelocked since Ark transactions spend along the collaborative path.

![](/ark/oor-previous-owner-exit.png#center)

### What protects against double spends?

This is the one place where trust really comes into play. OOR transactions spend
via a VTXO's collaborative path with the operator and so no Ark transaction can be
created without the operator involved to agree on how you spend the VTXO. This
means that if VTXO A's owner collaborates with the operator to create an Ark tx
that spends VTXO A and create VTXO B for you, then you must trust that the operator
will refuse to then sign requests from VTXO A's owner to double spend that VTXO in
a different transaction. So when you enter the realm of OOR, you need to understand
that this trust assumption exists. Luckily, it is very easy to prove that an
operator has misbehaved in this way as you'd be able to show the public two fully
signed transactions that double spend the same VTXO. This would prove to the public
that the operator is not trustworthy and would destroy its reputation.

![](/ark/oor-double-spend.png#center)

### What is the best practice for a receiver?

Due to all the reasons mentioned above, if you receive an OOR derived
(pre-confirmed) VTXO then unless you are planning on immediately spending it via
another OOR, the best practice is to do a batch swap and forfeit the VTXO for an
in-round (confirmed) VTXO. That way you don't have to worry about the operator
double spending your VTXO input and you have the minimal number of transactions to
unroll. You also then avoid the risk of a spent VTXO owner in your VTXO's lineage
attempting to unilaterally exit.

![](/ark/oor-deep-batch-swap.png#center)

## Griefing Attack

Now that we understand the basis of an OOR transaction, we can dive into an attack
that is possible if we stick to the simplified approach. This will then help us
understand why checkpoint transactions are required.

**Step 1**

Let's say we have the following batch where Alice is a participant with a single
VTXO controlled by her public key, <code>P<sub>A</sub></code>:

![](/ark/oor-grief-1-confirmed-vtxo.png#center)

**Step 2**

She then creates a simple Ark transaction (OOR) that spends this VTXO and creates a
new one that spends to the same public key (in other words, she spends it back to
herself).

![](/ark/oor-grief-2-ark-tx.png#center)

**Step 3**

She can do this a couple of times and create an arbitrarily long Ark transaction
chain.

![](/ark/oor-grief-3-chain.png#center)

**Step 4**

Finally, Alice does a batch swap which forfeits the pre-confirmed VTXO for a
confirmed VTXO in a new batch:

![](/ark/oor-grief-4-batch-swap.png#center)

**Step 5**

Now, Alice can try to claim both VTXOs at the same time. She does this by unrolling
batch 1 all the way until `vtx4` which will put the initial VTXO on-chain.

![](/ark/oor-grief-5-unroll.png#center)

**Step 6**

This will force the operator to broadcast and confirm the rest of the spending Ark
transactions all the way up to the forfeit transaction in order to prevent Alice
from stealing the funds. The operator is completely responsible for the fees of the
entire chain. In the meantime, Alice is free to use her new refreshed VTXO.

![](/ark/oor-grief-6-operator-pays.png#center)

Thankfully, we can use checkpoint transactions in order to help protect the
operator from this attack.

## Checkpoints

I previously showed you this simplified example of an Ark transaction that spends a
VTXO and creates a new one:

![](/ark/oor-tx-details.png#center)

With checkpoints, we instead use the following construction. I'll explain the
construction first and then run through an example showing how this then helps us
in the griefing attack.

We'll just use the situation where a VTXO A owner, Alice, wants to spend her VTXO
and create VTXO B for Bob. The following steps are required:

If this feels familiar, it should. It is the same <a href="../../posts/ark-vtxos-and-trees#the-signing-order" target="_blank" rel="noopener noreferrer">signing order</a> we saw when building a batch transaction: prepare the input unsigned, let the other side build the finished thing around it, check it, and only
then sign.

**Step 1**

Alice will create two transactions and sends them to the operator.

- A **Checkpoint Transaction** which spends VTXO A and pays to a sweep script
  "owned" by the operator (the multisig path with Alice and the Operator's keys and
  a timeout path that pays to the operator). Alice does not yet sign the input of
  this transaction.
- An **Ark transaction** which spends from the checkpoint transaction via the
  collaborative path and creates the new VTXO paying to a VTXO script owned by Bob.
  Alice provides her signature for the input of this transaction.

![](/ark/oor-checkpoint-1-alice-builds.png#center)

**Step 2**

The operator validates both, signs both and sends the signatures back to Alice.

![](/ark/oor-checkpoint-2-operator-signs.png#center)

**Step 3**

Alice validates the operator's signatures. She can now safely sign the checkpoint
transaction (which in a sense forfeits her VTXO and signs over ownership to the
operator) because she has the safety of the fully signed Ark transaction which will
spend the checkpoint transaction via the collaborative path in the way that Alice
intends.

![](/ark/oor-checkpoint-3-alice-signs.png#center)

## Griefing attack attempt 2

Now we'll replay the griefing attack from before and we'll see how the checkpoint
transactions change the game.

**Step 1**

We once again start with Alice having her confirmed VTXO:

![](/ark/oor-grief2-1-confirmed-vtxo.png#center)

**Step 2**

She again spends it and pays back to herself, but now she has to use a checkpoint:

![](/ark/oor-grief2-2-checkpoint-spend.png#center)

**Step 3**

Once again she does this a couple of times to create a longer chain:

![](/ark/oor-grief2-3-chain.png#center)

**Step 4**

Finally, she again forfeits the end of the long chain in exchange for a new VTXO in
a new batch:

![](/ark/oor-grief2-4-batch-swap.png#center)

**Step 5**

The attack begins and Alice tries to unroll her first VTXO on-chain:

![](/ark/oor-grief2-5-unroll.png#center)

**Step 6**

This time, all the operator needs to do is to broadcast the very next checkpoint
transaction that spends from `vtx4`.

![](/ark/oor-grief2-6-next-checkpoint.png#center)

If the client does not act, the operator will just be able to spend the checkpoint's
output after the timeout expires since the operator owns the timeout path. So the
operator no longer needs to race to get the full chain confirmed.

**Step 7**

This now forces Alice to get the signed Ark transaction that spends `cp1` confirmed
to get back ownership of the funds:

![](/ark/oor-grief2-7-client-pays.png#center)

**Step 8**

Once again the operator can just broadcast the very next checkpoint. This process
repeats all the way to the end of the chain where the forfeit is finally broadcast.

It is worth putting the two versions of the attack side by side, because one label
changes and it is the whole point. In the first version, confirming that chain was
the operator's responsibility and Alice paid nothing to make it happen. With
checkpoints, ratcheting the chain forward is the client's responsibility, and Alice
pays for every step of it.

So with checkpoint transactions, the client is incentivised not to try this attack
since they are no longer easily able to grief the operator and they would need to
spend quite a bit on fees in order to ratchet the chain of transactions forward
anyways.

## Checkpoint Transaction down sides

As you can probably tell, the checkpoint solution is not exactly very elegant. It
means that both operator and VTXO owner need to store a much longer chain of
transactions if they want to unroll or protect against fraud. Unrolling also
becomes much more expensive to do. So once again this means that the best practice
is to perform a batch swap in order to exchange your pre-confirmed VTXO for a
confirmed one so that you can throw away the long chain of checkpoint and Ark
transactions.

## Wrapping up

Ark transactions are what make an Ark usable day to day. You can pay someone in the
time it takes to swap a few signatures, with no batch transaction and no on-chain
confirmation standing in the way. What the receiver ends up holding is a
preconfirmed VTXO, and most of this part has been about what that word is quietly
carrying: the receiver has to watch for the sender unrolling the branch out from
under them, the sender and the operator could always have been working together,
and the chain of transactions sitting behind the coin only ever gets longer.

Checkpoints deal with the griefing problem by making the client pay to ratchet its
own chain forward instead of the operator. They do not make the chain any shorter.
The fix for that is the same one as everywhere else in this series: batch swap,
trade the preconfirmed VTXO for a confirmed one, and throw the chain away.

That is the end of the series. Between the three parts you should now have the
whole picture: how a VTXO is built and how a tree of them shares one on-chain
output, how you get out again, and how you can spend in between.

[litepaper]: https://docs.arklabs.xyz/ark.pdf
[arkade]: https://github.com/lightninglabs/ark
[forfeits]: ../../posts/ark-forfeits-and-connectors
