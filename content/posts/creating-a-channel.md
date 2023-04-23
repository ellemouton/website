---
title: "LN Things Part 1: Creating a channel"
summary: "Day 1 of #7DaysOfBitcoin"
date: 2021-03-21
aliases:
  - /blog/view/3
  - /creating-a-channel   

cover:
  image: "/lnThings/btc_ln.png"
---

### What is a channel?

It is literally just a transaction sending funds to a 2-of-2 multisig
transaction. This creates an unspent UTXO and the channel is open until that
UTXO is spent (crazy to think that the current state of the LN is just a subset
of the current UTXO set). During the lifetime of the channel, a bunch of
transactions are created that double spend the funding tx and eventually one of
those (and only one. No double spends bro) will go on-chain and the channel will
be closed. Ideally you only see these two on-chain transactions: one to open the
channel and one to close it.

### Creating a channel:

To create a channel we need to somehow get this initial funding channel
on-chain. How this is done can be gleaned from [BOLT2] but I will go through my
understanding of it here. The following screenshot is from the bolt and shows
the various messages sent between two nodes during channel creation. I will go
through each of these.

![name](/lnThings/open_chan_msg.png#center)

Since commitment transactions are part of the update layer (and ie will be
analysed in a future post) I wont get into those details now but the important
thing to know is that once a funding transaction is established and confirmed,
commitment transactions are used to define the state that the channel is in (how
the funds are distributed between the participants in the channel). So each
commitment transaction pretty much just spends the funding transaction (uses the
funding tx as its input) and then has outputs that define the division of funds
between the participants.

The funding transaction for a channel between Alice and Bob is simply a
transaction that has an output of the following form:

```
2 <pubkeyA> <pubkeyB> 2 OP_CHECKMULTISIG 
```

Where `<pubkeyA>` is the Alice’s public key and `<pubkeyB>` Bob’s. Currently in
the Lightning Network a channel is always funded by one side. So in our example
lets say that Alice wants to open, and hence fund, the channel. The question is:
how does she do this? Can she simply just send funds to the above script? No she
cant because there is a chance that Bob might disappear and never be around to
sign any transaction that attempts to spend from the funding transaction and
this would mean that Alice’s funds would be stuck in this UTXO forever. Let’s go
through each of the messages shown in the above diagram to see how it is done
then.

#### open_channel:

Alice sends this message to Bob to indicate that she wants to open a channel
with him. This message includes various details regrading Alice’s requirements
of the channel but the important one is the `funding_pubkey`. This is the public
key that Alice intends to use as her public key in the funding transaction
script.

 ![](/lnThings/open_chan.png#center)

#### accept_channel:

If Bob is happy with the terms that Alice has put forward in her channel offer,
then he can send back the `accept_channel` message which also contains some of
his requirements along with the `funding_pubkey` that he intends to use.

 ![](/lnThings/accept_chan.png#center)

At this point, Alice has all that she needs to construct the funding
transaction. However, she at this moment still does not broadcast the funding
transaction because she still has no guarantee that Bob will not disappear. So
what she needs is a commitment transaction signed by Bob that spends from the
funding transaction and divides the channel balance accordingly. It could be the
case that the initial division of funds allocates some funds to Bob too and so
Bob would also want a valid commitment transaction that he can broadcast in case
Alice disappears (the concept of asymmetric commitment transactions will be
discussed in detail in a future post. For now, just know that both sides have a
commitment transaction) . What Alice does now is construct the funding
transaction (using Segwit inputs only so that the TXID of the transaction can
not be changed due to script sig field malleation) but she does not broadcast
the transaction. She sends bob the following message:

#### funding_created:

 ![](/lnThings/funding_created.png#center)

This message contains the TXID of the funding transaction, the relevant output
index of the funding transaction along with a signature for Bob’s commitment
transaction (if Bob is following the rule then Alice is able construct the exact
commitment transaction that he is holding and is thus able to provide her
signature for it). Note that Bob cannot yet do anything with his commitment
transaction since it is spending from a transaction that is not on the
blockchain yet.

#### funding_signed:

If Bob is happy then he can send Alice a `funding_signed` message.

 ![](/lnThings/funding_signed.png#center)

This message will contain a Bob’s signature for Alice’s commitment transaction.

At this point, Alice now has a valid commitment transaction signed by Bob that
spends from the funding transaction that sends her funds back to her. It is thus
safe for her to now broadcast the funding transaction.

#### channel_ready:

Both parties will be monitoring the blockchain at this point waiting for the
funding transaction to be confirmed. Once each party sees it, they will send the
other party the `channel_ready` message which contains the channel ID of the
channel.

The channel is now open. YEET!

 ![](/lnThings/channel_ready.png#center)

[BOLT2]:https://github.com/lightningnetwork/lightning-rfc/blob/master/02-peer-protocol.md


