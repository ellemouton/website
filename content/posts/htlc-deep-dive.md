---
title: "LN Things Part 5: HTLC Deep Dive"
summary: "Day 7 of #7DaysOfBitcoin"
date: 2021-03-27
aliases:
  - /blog/view/7
  - /htlc-deep-dive

cover:
  image: "/lnThings/bolt.png"
---

In previous post gave a simplified overview of HTLCs. This post will look in more detail at what these HTLCs actually look like and how they fit in the commitment transactions.

From [*Part 2*](/updating-state) on the Update layer, we learned a few things about how commitment transactions are done:

First of all, they are asymmetric: Alice and Bob (the two participants of a channel) each hold their own commitment transactions.
The commitment transactions that each participant holds looks slightly different to that of their peer in that any output going to the local node must be encumbered by a relative time lock of `to_self_delay`. This is to give the other party a chance to spend along the revocation path of the output if they need. 

Given the above requirements of a commitment transaction, let’s look at how HTLC’s will fit into all of this. To do this, let’s use the example from the previous post where Alice is sending 2 BTC to a recipient and is using her channel with Bob as the first hop in the route (he might even be the final recipient). Remember that Alice has been given a hash, `H`, to which she needs to pay. In this example, Alice is the HTLC offerer and Bob is the HTLC receiver.

### Zooming in on Alice:

Let’s zoom in on how Alice will construct her commitment transaction to now include the HTLC. The commitment transaction will have three outputs:

- One 5 BTC output to Bob (spendable immediately).
- One 3 BTC output with two possible spending paths: One spendable by Alice after a `to_self_delay` and one immediately spendable by Bob if he has the required revocation key (see post 2 and post 3 for more details on revocation).
- One 2 BTC output with…. ok so here is where it gets tricky. Let’s think about what needs to be here a bit.

 ![](/lnThings/day7_1.png#center)

This output is where the HTLC magic must happen. We need the following spending paths on this output:

- It needs to be spendable by Bob if he has the pre-image of `H` (hash-locked path)
- Or spendable by Alice after `cltv_expiry`
- Or spendable by Bob immediately if he has the revocation key

BUT remember that Alice’s outputs to herself must always have a relative timelock of `to_self_delay` even after `cltv_expiry`. Knowing this, let’s update the HTLC spending paths a bit:

- It needs to be spendable by Bob if he has the pre-image of `H` (hash-locked path)
- Or spendable by Alice after absolute time `cltv_expiry` AND after relative delay `to_self_delay`
- Or spendable by Bob immediately if he has the revocation key

There is still a problem: Making the output to Alice encumbered by both these timelocks could in the worst case extend the HTLC’s timeout by `to_self_delay`. In other words, Bob could have an extra `to_self_delay` blocks in order to sweep the hash-locked output even though the HTLC is technically expired. So what is done instead is that instead having this output being locked by both timelock conditions, it is instead only locked by just the `cltv_expiry` one and then instead of sending funds to Alice directly, the funds are instead sent to a separate HTLC-timeout transaction (signed by both Alice and Bob) and this separate time out transaction then enforces the `to_self_delay`. This allows Alice to definitively lock in the fact that the HTLC has expired and removes Bob’s ability to claim the hash-locked output all while still ensuring that Alice can only get her funds after `to_self_delay` and thus still allow Bob to spend from the revocation path (of the HTLC-timeout transaction) if needed.

The final state of the commitment transaction’s HTLC output spending paths is as follows:

- One spending path to Bob if he pre-image of `H` (hash-locked path)
- One spending path to Bob if he has the revocation key.
- One spending path to a second-state HTLC-timeout transaction.

The HTLC-timeout transaction has the following construction:

* The transaction itself is timelocked with `nLocktime` set to `cltv_expiry`. Thus the spending path in the original commitment transaction that sends to this HTLC-timeout transaction is effectively time delayed by `cltv_expiry`.
* The transaction has one output with two possible spending paths:
   - one to Alice after `to_self_delay`
   - one to Bob if he can provide the revocation key.

![](/lnThings/day7_2.png#center)

The Script for Alices (the HTLC offerer) commitment transaction’s HTLC output looks as follows:

```
# To remote node with revocation key
OP_DUP OP_HASH160 <RIPEMD160(SHA256(revocationpubkey))> OP_EQUAL
OP_IF
    OP_CHECKSIG
OP_ELSE
    <remote_htlcpubkey> OP_SWAP OP_SIZE 32 OP_EQUAL
    OP_NOTIF
        # To local node via HTLC-timeout transaction (timelocked).
        OP_DROP 2 OP_SWAP <local_htlcpubkey> 2 OP_CHECKMULTISIG
    OP_ELSE
        # To remote node with preimage.
        OP_HASH160 <RIPEMD160(payment_hash)> OP_EQUALVERIFY
        OP_CHECKSIG
    OP_ENDIF
OP_ENDIF
```

You can see in the script above that the first path is the revocation path, the second is the path to the HTLC-timeout transaction (the time-locked path) and the third is the hash-locked spending path.

The HTLC-timeout transaction output script looks as follows:

```
OP_IF
    # Penalty transaction
    <revocationpubkey>
OP_ELSE
    `to_self_delay`
    OP_CHECKSEQUENCEVERIFY
    OP_DROP
    <local_delayedpubkey>
OP_ENDIF
OP_CHECKSIG
```

### Zooming in on Bob:

Let’s now zoom in on how Bob (the HTLC receiver) will construct his commitment transaction to include the HTLC. The commitment transaction will have three outputs:

- One 3 BTC output to Alice (spendable immediately).
- One 5 BTC output with two possible spending paths: One spendable by Bob after a `to_self_delay` and one immediately spendable by Alice if she has the required revocation key
- Again the 2 BTC output on Bob’s commitment transaction is a bit complicated. Let’s dive in.

![](/lnThings/day7_3.png#center)

Let’s again think about what spending paths this output should have:

- There should be a spending path that Bob can claim if he has the pre-image of `H` (hash-locked path) but since it is an output to himself it needs to have a `to_self_delay`.
- One spending path should be spendable by Alice immediately by Alice if she has the necessary revocation key.
- One spending path also needs to be spendable by Alice after `cltv_expiry` (time-locked output).

The problem with having all the above spending paths in the same script is that if Bob knows the pre-image but now has to wait `to_self_delay` blocks in order to spend from the hash-locked path then there is a chance that this `to_self_delay` is longer than the `cltv_expiry` that Alice must wait in order to claim the time-locked path. So Alice could potentially spend along the time-locked even though Bob does have the pre-image. Similar to the situation with Alices commitment transaction, Bob needs a way to lock in the fact that the hash-locked path will be used while still delaying his redemption of the funds by `to_self_delay`. So, a separate HTLC-success transaction is used for this thus allowing Bob to spend from the hash-locked path to this HTLC-success transaction which will then separately enforce the `to_self_delay` condition. 

The final state of the commitment transaction’s HTLC output spending paths is as follows:

- One spending path to Alice if she has the revocation key (revocation path)
- One spending path to Alice after `cltv_expiry` (time-locked path)
- One spending path to the HTLC-success transaction IF Bob can reveal the pre-image of `H` (hash-locked path).

The HTLC-timeout transaction has the following construction:

* The transaction is not time locked (unlike in Alice’s case).
* The transaction has one output with two possible spending paths:
   - one to Bob after `to_self_delay`
   - one to Alice if she can provide the revocation key.

![](/lnThings/day7_4.png#center)

The Script for Bob’s (the HTLC receiver) commitment transaction’s HTLC output looks as follows:

```
# To remote node with revocation key
OP_DUP OP_HASH160 <RIPEMD160(SHA256(revocationpubkey))> OP_EQUAL
OP_IF
    OP_CHECKSIG
OP_ELSE
    <remote_htlcpubkey> OP_SWAP OP_SIZE 32 OP_EQUAL
    OP_IF
        # To local node via HTLC-success transaction.
        OP_HASH160 <RIPEMD160(payment_hash)> OP_EQUALVERIFY
        2 OP_SWAP <local_htlcpubkey> 2 OP_CHECKMULTISIG
    OP_ELSE
        # To remote node after timeout.
        OP_DROP <cltv_expiry> OP_CHECKLOCKTIMEVERIFY OP_DROP
        OP_CHECKSIG
    OP_ENDIF
OP_ENDIF
```

You can see in the script above that the first path is the revocation path, the second is the path to the HTLC-timeout transaction (and is also the hash-locked path) and the third is the time-locked spending path.

The HTLC-timeout transaction output script looks as follows:

```
OP_IF
    # Penalty transaction
    <revocationpubkey>
OP_ELSE
    `to_self_delay`
    OP_CHECKSEQUENCEVERIFY
    OP_DROP
    <local_delayedpubkey>
OP_ENDIF
OP_CHECKSIG
```
### All together now:

The final construction looks as follows:

![](/lnThings/day7_5.png#center)

Yeeeeet!
