---
title: "The Ark Protocol: VTXOs and the Virtual Transaction Tree"
summary: "How many users share one on-chain UTXO while keeping custody of their funds"
date: 2026-08-19
ShowToc: true

cover:
    image: "/ark/cover-vtxos.png"
---

## Test test, is this thing on?

Howzit y’all! It’s been a while. I’m stepping away from the Bitcoin space for now, and before I go I wanted to write down what I’ve spent the past year or so learning about. So: Ark.

You have probably heard about the Ark protocol by now but you may have many questions about how it works. My aim here is to explain the protocol step by step (did someone say diagrams?) so that any questions you may have are answered. I’ll run through various examples to help nail down understanding as well. I’ll break this up into a few articles:

<div style="border:1px solid var(--border);border-radius:var(--radius);padding:1rem 1.25rem;margin:1.5rem 0;background:var(--entry);">
<strong>The Ark series</strong>
<ol style="margin:0.6rem 0 0;padding-left:1.3rem;line-height:1.6;">
<li><strong>VTXOs and the Virtual Transaction Tree</strong> &nbsp;<em>(you are here)</em><br>The why, plus the Virtual Transaction Tree and Batch transaction concepts.</li>
<li><a href="../../posts/ark-forfeits-and-connectors" target="_blank" rel="noopener noreferrer"><strong>Forfeit Transactions and Connector Trees</strong></a><br>How you leave the Ark or keep a VTXO alive.</li>
<li><a href="../../posts/ark-oor-transactions" target="_blank" rel="noopener noreferrer"><strong>Out-of-Round Transactions</strong></a><br>Also called OOR transactions or Ark transactions, along with Checkpoint transactions.</li>
</ol>
</div> The ideas here are not new but instead glean ideas from the <a href="https://docs.arklabs.xyz/ark.pdf" target="_blank" rel="noopener noreferrer">Ark Labs lite paper</a>, which I will refer back to throughout.

## The Big Picture

The brief description of Ark is that it allows users of Bitcoin to essentially _share_ a UTXO. Each user participating in the Ark has one or more VTXOs (Virtual UTXOs) which they can spend as new transaction inputs to create new VTXO outputs - just like the UTXOs we all know and love except that for in the happy case, these off-chain VTXOs and virtual transactions (VTXs) never need to make it on-chain. So an Ark is a virtual world that is backed by a number of real, confirmed UTXOs where users can use their bitcoin as per usual without each transaction needing to be confirmed on-chain. This means transacting can happen much faster and much cheaper than in the normal UTXO case. When a user of the Ark does want to exit the Ark to produce a normal UTXO, they still will pay a much lower fee due to the fact that the batch transaction producing the UTXO is shared by many users and the Ark operator and so even that fee will be substantially less than normal UTXO fees.

Ok ok so there are many questions that may be arising for you at this point: what exactly is the trust model here? What are the tradeoffs? We will get to all of these in the journey that follows. For now, a good place to start is the Virtual UTXO. What does it look like and how does the concept allow multiple users to “share” a UTXO? Let’s dive in.

## VTXOs and the Virtual Transaction Tree (VTXT)

The big question we want to answer here is: how can one UTXO be shared by multiple users in such a way that they still maintain custody of their funds?

This is done by using a set of pre-signed transactions that take the form of a tree (a Virtual Transaction Tree or VTXT) and using a central operator that helps to facilitate the construction and signing of this tree. In the happy-path case, none of the transactions in this tree ever need to go on-chain.

### The VTXO

Let’s start off by looking at a single VTXO within the tree. If you are a participant in the tree, this will be an output that you control. The output is a Taproot output and has two spend paths (if you need to brush up on Taproot scripts, see my <a href="../../posts/taproot-prelims" target="_blank" rel="noopener noreferrer">previous article</a> on the topic).

![](/ark/vtxt-taproot-output.png#center)

The two spend paths are:

**Collaborative Spend Path**

This path is immediately spendable if both the VTXO owner (<code>P<sub>c</sub></code>) and the Operator (<code>P<sub>o</sub></code>) can agree on the transaction spending the output. It is a 2-of-2 Multisig path. This is the path to be used in the off-chain happy paths.

**Unilateral Spend Path**

This is a time delayed path that can be spent by the owner of the VTXO after a CSV delay (info: a CSV timeout starts ticking when the parent transaction gets confirmed in a block. So this is a _relative_ timeout). This path exists for the case where the participant wants to exit the Ark unilaterally without the cooperation of the operator and is what keeps the funds under the participants’ control. If a client decides to unilaterally exit, they take this output on-chain, wait for the CSV timeout to pass and then spend the funds freely.

What does this look like under the hood? Well, like all Taproot outputs, the actual output script will just be a normal `OP_1` that pays to a Taproot output key, `Q`. This `Q` is made up of an internal NUMS point key along with the two mentioned scripts committed via a Tap Tweak.

From now on, I’ll represent VTXO outputs in the following, more condensed, format:

![](/ark/vtxt-condensed-vtxo.png#center)

The `v` here being the value in bitcoin being committed to the output. The <code>MultiSig(P<sub>o</sub>, P<sub>c</sub>)</code> represents the collaborative path and the <code>t<sub>e</sub>(P<sub>c</sub>)</code> represents the relative time path.

One quick aside here to note is that we are specifically using MultiSig for the VTXO scripts. This means that the two parties involved can independently create their signatures when spending an output as opposed to MuSig2 where they would need to have an interactive round in order to create the signature. MuSig2 scripts will be used for other upcoming scripts in our tree construction. Technically, either one is possible but both come with tradeoffs. With MuSig2, we get the nice property of using the keyspend path in the taproot output meaning that we can just produce a single Schnorr signature and not need to pay for all the script bytes on chain but the tradeoff is requiring the interactive signature construction. With MultiSig, we remove the need for interactivity & the extra rounds but we need to pay for the extra taproot script reveal and script inclusion proof.

Alright, now we know what a single VTXO output looks like. But we know we want to get to a construction where we are “embedding” _multiple_ of these outputs within a single UTXO. So let’s work with an example where we have four VTXOs for four different clients that we want to represent. Here we have four different participants each with a different output value and unique spending script.

![](/ark/vtxt-four-vtxos.png#center)

But these are just output scripts. They need to be included in transactions for them to be meaningful. So let’s put each one in a Virtual Transaction (VTX). These VTXs will eventually be the leaves of our Virtual Transaction Tree (VTXT). Note the labelling of the various transactions: `vtx1`… `vtx4`.

![](/ark/vtxt-leaf-txs.png#center)

You might be asking: “Why not have all the outputs in a single transaction?”. The reason is that we want participants to be able to exit the ark unilaterally without requiring the rest of the participants to exit. If a single transaction was used to represent all the VTXOs then if one client decided to take their output on-chain, they would start the CSV timeout for all participants who share the transaction and thereby force them to exit the Ark. Therefore, each VTXO gets its own transaction. One detail to note that I’m leaving out of the diagrams is that all these transactions make use of <a href="https://bitcoinops.org/en/topics/ephemeral-anchors/" target="_blank" rel="noopener noreferrer">Ephemeral Anchors</a>. This allows the picking of transaction fees to happen at the time of on-chain broadcast via <a href="https://bitcoinops.org/en/topics/cpfp/" target="_blank" rel="noopener noreferrer">CPFP</a>.

Ok great, we have our first set of VTXT leaf transactions representing our four VTXOs. Now we need to work backwards to see how we can use a single on-chain UTXO to represent these. What we do next is to create a layer of virtual branch transactions that will produce the outputs that will be used as inputs for the layer of leaf transactions we have.

![](/ark/vtxt-branch-layer.png#center)

A few things to note about the diagram above:
- I’ve chosen a radix of 2 here meaning that each branch transaction branches out to two new outputs. But we could have chosen a radix of four too. There are tradeoffs which we can get into later on. For the purpose of this example, we will stick with two.
- If you look closely at the scripts of the branch transaction outputs, they differ to the VTXO outputs in two ways:
    - Here we have switched to MuSig2 for the collaborative path.
    - The timeout path here is spendable by the _Operator_ and so these outputs are “owned” by the Operator. This is an important difference. If one of these transactions ends up on-chain but the leaves spending them do not, then it does not mean anything for the Ark participants and their VTXO balances within the Ark. It just means that after the given timeout, the Operator will be able to sweep the funds. Note: participants in this tree would _refresh_ their VTXOs before the operator sweeps the funds - but we will get to that later on.

So now we have these two branch transactions that are basically “embedded” in the leaf transactions. The leaf transactions will have inputs that point specially to these branch transactions & so the leaf transactions only become meaningful if the branch transaction creating the input it requires ever makes it on-chain. And how do participants know that the branch transaction outputs won’t just be spent in some other way other than via the leaf transactions that pay to their VTXOs? Because as we will see during the setup flow of the tree, all these tree transactions will be pre-signed by all participants and the Operator and the participants would only ever be incentivised to sign the valid leaf transactions that spend the branch transaction outputs. This is the only time they would happily sign for the collaborative path. And because of the TapTree being used in the branch transactions, the only other way for those outputs to be spent would be for the operator to broadcast them and then wait for the timeout branch to become active.

We then repeat this embedding process with another layer which for this example happens to be the root transaction:

![](/ark/vtxt-root-tx.png#center)

The important thing to notice this time is that the outputs now are the combination of the value amounts required for the two branch transactions. So the 0 index output of `vtx7` pays a total of <code>v<sub>1</sub></code>+<code>v<sub>2</sub></code> and the collaborative path must include MuSig2 signatures for both participants <code>P<sub>0</sub></code>, <code>P<sub>1</sub></code> and the operator, <code>P<sub>o</sub></code>. The timeout path remains owned by the Operator.

The final step is to construct the script of the UTXO that will actually appear on-chain that will represent the above tree:

![](/ark/vtxt-final-tree.png#center)

Note once again what this output includes: the value paid to it is the combination of all the individual VTXOs in the tree and the MuSig2 keypath includes each participants public key along with the operator’s key. And once again, the timeout path is owned by the operator. This timeout path owned by the operator (along with the other operator owned timeout paths in the tree) actually has a special name: the Sweep Path. This final output is called a “Batch Output” and after the <code>T<sub>e</sub></code> expiry, it expires and the operator will sweep the funds from the batch output.

Right, so what ends up onchain is a Batch Transaction with a Batch Output like the following:

![](/ark/vtxt-batch-tx.png#center)

## Unilateral Exit / Unrolling

The important thing to grasp here is that the full tree can go on-chain if needed. During the setup of the tree (which we can cover later), participants and the operator provide all the signatures required such that any participant ends up with the full chain of fully signed transactions from the batch transaction all the way down to the transaction with their VTXO. This means that at any time, if the user wanted to, they can exit the Ark by broadcasting this chain of transactions. They would just need to take responsibility for paying the fees to get the transactions confirmed. Let’s walk through an example to see how a participant would go about doing this and how it would affect the rest of the participants along with the operator.

Let’s walk through this. Here is a recap of what the full tree looks like:

![](/ark/vtxt-tree-recap.png#center)

I’ve highlighted in yellow the transactions that participant 1 would care about & would need to keep at hand:

![](/ark/vtxt-p1-path.png#center)

So to exit, participant one would just need to broadcast the above chain one by one. They can do this immediately since all the transactions spend the collaborative paths of the previous outputs. When the final leaf transaction makes it on-chain, the participant would just need to wait for the relative time delay to pass and then they can sweep the output. There is no risk of the operator sweeping that output at any time since the participant has not signed for a transaction that spends that output via the collaborative path. The only thing that the participant must keep in mind is that the confirmation of the batch transaction and all the virtual tree transactions that have an operator owned sweep path must be spent via the collaborative path before the timeout that would allow the operator to sweep the funds via the sweep path.

Notice how this unilateral exit by one participant does not require the final leaf transactions of any of the other participants to go on-chain! So all other participants remain active in the Ark. The Ark floats on!

## Batch Expiry

Let’s walk through the scenario of the batch expiry being reached for both the happy path where none of the other virtual transactions make it on-chain and for the case where a participant has exited.

### Happy Path

In the happy case, only the main batch transaction with the batch output makes it on-chain. Once the output expires, the operator can sweep the funds to itself via a single sweep transaction and without the cooperation of any of the other participants.

![](/ark/vtxt-happy-sweep.png#center)

### Sweeping after unilateral or partial exit

In the case where some of the transactions from the VTXT make it on chain due to one or more of the parties attempting to unilaterally exit, the operator can sweep any of the unspent outputs owned by it as follows:

![](/ark/vtxt-sweep-after-exit.png#center)

At this point you may still have many questions like:
- What happens with my VTXO at expiry time? Does the Operator just get all my funds at this point?
- Great, I have a VTXO - but what can I do with it?

## Building the Batch Transaction

We’ve now seen what the VTXT structure looks like. But what we haven’t answered is how we actually get to this state. How do multiple users who do not trust each other and do not trust the operator come together to reach the state in which they can all partake in the Ark by forming the VTXT such we end up with the desired batch transaction on-chain along with all participants holding the proof they need that they own a VTXO within that batch output and are able to claim their funds at any time? In this chapter, we will focus on answering this question.

We’ll walk through an example that builds up to a tree that looks like the example we’ve been using. We start with Alice, Bob, Dave and Carol who will use public keys. <code>P<sub>1</sub></code>, <code>P<sub>2</sub></code>, <code>P<sub>3</sub></code> and <code>P<sub>4</sub></code> respectively. The end goal of each participant is to end up with a VTXO of value <code>v<sub>1</sub></code>, <code>v<sub>2</sub></code>, <code>v<sub>3</sub></code> and <code>v<sub>4</sub></code> respectively. For this example, we will assume that no party has joined the Ark yet and so all participants only have on-chain UTXOs.

<div style="border:2px dashed #b0b0b0;border-radius:8px;padding:1.25rem;margin:1.5rem 0;text-align:center;color:#8a8a8a;font-size:0.9rem;line-height:1.5;"><strong style="letter-spacing:0.08em;">DIAGRAM 13</strong><br>the four participants Alice, Bob, Dave and Carol with their boarding UTXOs</div>

**Step 1: create a boarding output**

Each participant will first create an on-chain boarding output. This output looks very similar to the output of a VTXO in that it is “owned” by the user in that it can be spent by the user unilaterally after a timeout but has a collaborative spend path with the operator that can be spent at any time if the operator and user collaborate. Each of our participants will fund such an output and get it confirmed on chain. Once it has been sufficiently confirmed, they will send a “Join Request” to the operator which will include details of where to find this boarding output along with the desired VTXO details that the user would like to exchange the boarding output for. The main information included here is the public key that the user would like to use for their VTXO along with the value they want to assign. Users could also swap one boarding UTXO in exchange for multiple VTXOs as long as the total value of the requested input (boarding UTXO) is more than the requested VTXO value sum. Each participant would have fetched the operator’s terms (their public key along with the CSV timeouts it expects) sometime before this registration phase.

**Step 2: Sealing the Round**

The process of forming the batch transaction which will describe the VTXT is called a “round”. During the registration phase above, the round is still being formed but at some point, the operator will decide to “seal” the round which means to cut off any new participants from entering the given round. At this point, the operator can build the entire batch transaction structure. The first thing it will do is to build the VTXT template. It does so by taking all the VTXO requests it collected from the participants and using those to build the tree (ie, compute all the virtual transactions within the tree).

The server at this point knows the batch output and so can build the rest of the batch transaction. It will use boarding transactions from the users as inputs. It may also add inputs of its own to further fund the transaction along with change outputs. We will later get to the other parts of this transaction.

Note that at this point in time, the full structure of the batch transaction and the VTXT is known but nothing has been signed yet. The users will not be willing to sign the collaborative path of their boarding UTXOs until they are sure that they will get the requested VTXOs in return. So at this point in time, the operator sends each user the unsigned transactions relevant to them. If we focus on Alice, Alice will be sent: the unsigned Batch transaction (which will include Alice’s boarding UTXO as one of the inputs) along with all the transactions in the VTXT that lead from the root output of the tree to Alice’s VTXO. Alice will verify the path to her VTXO before continuing.

operator starts a registration phase. Its public key, <code>P<sub>o</sub></code>, is advertised up front and all wanna-be participants know it along with other operator terms like the batch expiry that it will use and any min/max VTXO amounts that it allows, as well as the radix that it will use for its VTXT construction.

There are multiple actions a client can take in a batch transaction but for now we will focus just on the boarding of the ark: clients all have onchain UTXOs that they would like to exchange for in-Ark VTXOs.

## Elle's TODOs carried over from the draft

- Step by step tree building, still to write: "Start at root with 5 pub keys + 5
  values and paying to the outputs. At this point that txid is known and so the next
  txs can be formed, and so on." This is the gap in "Building the Batch Transaction",
  which currently stops after Step 2 with nothing signed yet.
