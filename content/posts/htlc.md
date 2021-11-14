---
title: "LN Things Part 4: HTLC Overview"
summary: "Day 6 of #7DaysOfBitcoin"
date: 2021-03-26
aliases:
  - /blog/view/6
  - /htlc   
---

 ![](/lnThings/htlc_heading.png#center)

The previous 2 posts were all about sending funds between the two participants of a channel (agreeing on current state and invalidating older state). This post will give an overview of HTLCs and how they allow multi-hop payments to be made. The next post will be a deep dive into exactly what these HTLCs look like and how they fit into the commitment transactions of a channel.

Let’s look at a simple example.

### Simple 3 node, 2 hop network:

In this example, the network is make up of three nodes (Alice, Bob and Charlie) and there are two channels set up: One between Alice and Bob and another between Bob and Charlie. Each channel has a capacity of 10 BTC and to start with the funds of each channel will be divided equally between the participants.

 ![](/lnThings/htlc1.png#center)

For the purposes of this overview of HTLCs, the commitment transactions describing the channels will be shown as they are in the diagram above, with one commitment transaction spending from the funding transaction and hence determining the channel state. This is not accurately representing the asymmetric construction described in post 2 but it will make the overview easier to understand. A more accurate description will be given in a later post.

Suppose that Alice would like to pay Charlie. She cant pay him directly since they do not have a shared channel and it is costly (in terms of time and money) to open a channel just for the purposes of a quick transaction. Instead, Alice can use her channel with Bob to route a payment to Charlie since Bob has a channel with Charlie.

### Step 1:  Generating and sharing the pre-image hash

Alice first needs to tell Charlie that she wants to pay him. Charlie will then generate a random secret, `S`, and get the hash of `S` which we will call `H`. Charlie then sends `H` to Alice.

 ![](/lnThings/htlc2.png#center)

Step 2: Setting up the chain of HTLCs

Let’s say that Alice wants to pay Charlie 1 BTC. She will then find a route to Charlie (A-B-C) and will see that in order to use this route she will need to incentivise Bob to help her out by paying him a routing fee. In this example Bob charges a flat fee of 1 BTC for routing payments and so Alice will be paying a total of 2 BTC: 1 BTC for routing and 1 BTC for the recipient, Charlie. Alice then communicates with Bob that she would like to route a payment through him and does this by suggesting that they update their channel’s commitment transaction to have the following outputs (remember this is overly simplified and in reality both Alice and Bob will have their own commitment transactions):

- An output of 3 BTC back to Alice
- An output of 5 BTC to Bob
- An output of 2 BTC to a special script that has 2 possible spending paths: The first path can be spent by Bob if he has the pre-image of `H`. The second path can be spent by Alice after an absolute time `cltv_expiry_AB`. This special script that locks up the 2 BTC is called a Hash and Time Locked Contract (HTLC) because it has one hash-locked path and one time-locked path.

Bob will be happy to update to this new channel state because he can see that he is not loosing money (if the transaction goes on-chain and he still does not have the pre-image then he still gets back his original funds). And he can see that if he co-operates and continues with the payment forwarding process then he will be rewarded with a routing fee if the payment is successful because he will be able to claim the hash-locked output on the transaction.

 ![](/lnThings/htlc3.png#center)

Bob then goes ahead and locks up some of his funds in a similar way in his channel with Charlie. He updates the channel commitment transaction to have the following outputs:

- An output of 4 BTC to Bob 
- An output of 5 BTC to Charlie
- An output of 1 BTC to an HTLC script that again has 2 spending paths: one spendable by Charlie if he can reveal the pre-image of `H` and one to Bob spendable after `cltv_expiry_BC`.

Bob is confident in locking his liquidity up in this way because if the payment fails then he will be able to claim his funds back along the HTLC’s time-locked path and if the payment is successful and the pre-image is revealed by Charlie when he spends along the hash-locked path then Bob will see this pre-image and will be able to claim the hashed-lock output in HTLC output from the commitment transaction he has with Alice.

 ![](/lnThings/htlc4.png#center)

When Charlie receives this HTLC offer from Bob, he can see that he in fact does know the pre-image, `S`, that hashes to `H` and so he knows that he can claim the hash-locked path of the commitment transactions HTLC output if it were to go on-chain. Ideally, channels should remain open though so instead of publishing the transaction on-chain and sweeping the hash-locked contract there, Charlie instead just sends the pre-image, `S`, to Bob. This proves to Bob that Charlie would be able to claim the HTLC output if they were to broadcast the commitment transaction on-chain and so now the two parties can agree to just update their commitment transaction to reflect that Charlie now has the 1 BTC extra:

 ![](/lnThings/htlc5.png#center)

Now that Bob has `S`, he can turn around and reveal `S` to Alice and thus prove to Alice that if their commitment transaction were to go on-chain, that Bob would be able to claim the hash-locked output. So as Bob and Charlie did in their channel, Alice and Bob similarly update their commitment transaction by removing the HTLC output and just reflecting the new balances:

 ![](/lnThings/htlc6.png#center)

Alice has now effectively paid Charlie 1 BTC and Bob has earned a routing fee of 1 BTC.

### Some extra details:

What if things go wrong? Perhaps Charlie goes offline and doesn’t respond to Bob with a pre-image. If this happens then Bob will need to broadcast the commitment transaction so that he can claim his funds back via the time-locked path of the HTLC. If he does broadcast the transaction but then Charlie comes back online before `cltv_expiry_BC` has been reached and goes and spends via the HTLC’s hash-locked path then Bob will be able to see the pre-image on the blockchain and will then be able to turn around to Alice and reveal the pre-image to her as per usual. From this example, you can see that it is important for the `cltv_expiry` values to decrease along the path from the sender to the receiver. This is because in the worst case, Charlie only reveals `S` to Bob just before `cltv_expiry_BC` and then Bob still needs time to turn around and reveal `S` to Alice before she is able to spend along the `ctlv_expiry_AB` path. Therefor `cltv_expiry_BC` must be before `ctlv_expiry_AB`.
