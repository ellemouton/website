---
title: "LN Things Part 2: Updating State"
summary: "Day 2 of #7DaysOfBitcoin"
date: 2021-03-22
aliases:
  - /blog/view/4
  - /updating-state   
---

 ![](/lnThings/update.png#center)

Today’s post is more of a set up for the next one. It describes the basics of the Lightning Network update layer using LN-Penalty. The next post will introduce HTLCs and then will dive into how the HTLCs fit into commitment transactions and how this plays along with the update layer.

The previous post described how Alice and Bob set up a channel. It mentioned that both Alice and Bob had commitment transactions that spent from the on-chain funding transaction and that the commitment transactions were both valid and could be published on the blockchain and pay the recipients what they are owed. 

This post will describe the commitment transactions in more detail and will also show how the participants of the channel can agree on a new division of funds. In other words: how they create new commitment transaction that splits the funds differently and at the same time invalidate the older commitment transactions that they have.

### Asymmetric commitment transactions:

In LN-penalty, each party in the channel will hold a commitment transaction representing the state of the channel. Why? To assigning blame. The commitment transactions held by each party vary slightly (details to follow) and this makes it clear which party broadcasted their commitment transaction and makes it possible for the correct party to be punished if they broadcast an invalid state. This concept will be made more clear in this post.

### Setting up state 1:

Let’s assume that Alice and Bob start out each owning 5 BTC in a 10 BTC channel. To set up their initial commitment transactions, each party will first create temporary private keys (`dA1` for Alice and `dB1` for Bob) and calculate their associated public key (`PA1` and `PB1`). Alice and Bob will then send each other the temporary public keys. At this point, both parties can construct their own commitment transaction. Alice’s will look as follows:

1. It will spend from the funding transaction.
2. It will have 2 outputs. (or more. HTLC outputs to come!) 
3. The `to_remote` output will send Bob his 5 BTC immediately.
4. the `to_local` output is fancier: It either sends Alice her 5 BTC after an OP_CSV `to_self_delay` or it can immediately be spent by Bob if he is able to prove that he has Alices temporary private key `dA1`. 

Bob will be able to construct Alice’s commitment transaction too and will thus be able to provide her with his signature for the input of her transaction (the one that spends from the channel’s funding transaction). And so Alice will have this valid transaction with Bob’s signature and so she can at any point sign it her self and broadcast it to the network to be confirmed in a block.

Bob will create his commitment transaction in a similar way. See the diagram below:

 ![](/lnThings/state1.png#center)

Note that at this point, either party can broadcast their commitment transactions to the network. For example, let’s say Alice broadcasts her’s. Bob will get his 5 BTC immediately and Alice will need to wait `to_self_delay` blocks before she is able to use her 5 BTC. She doesn’t need to worry about Bob spending her output though because she knows that she never shared her secret private key with him.

### Setting up state 2:

Now Alice wants to send Bob 1 BTC using their channel. So just like for stage 1, both parties will now generate new temporary private keys (`dA2` for Alice and `dB2` for Bob), calculate their associated public key (`PA2` and `PB2`) and share the public keys with each other. And again, both parties will create commitment transactions to reflect this new state where Alice has transferred one of the BTC to Bob. The problem is that Alice still has the valid commitment transaction from before which is more profitable for her. To invalidate this old state and to prove to Bob that she is committing to this new state where she has paid him, Alice will send Bob her initial temporary private key (`dA1`). Since Bob now has this key, if Alice ever posts the old state, Bob will be able to spend Alice’s `to_local` output before she is able to claim it. Bob also sends Alice his old key (`dB1`) in order to invalidate his old state. He has no reason not to do this since the new state is more profitable to him.

![](/lnThings/state2.png#center)

That’s it! Alice and Bob can now update their shared channel state and invalidate old states.  
