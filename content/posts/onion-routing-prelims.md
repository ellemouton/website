---
title: "Lightning Network Onion Routing: Preliminaries"
summary: "This post covers the basics of choosing a path and packaging 
information for each hop on the path"
date: 2024-03-25
ShowToc: true

cover:
    image: "/onion_prelims/cover.png"
---

# Overview

In this post will cover the preliminaries you need to be aware of for 
pathfinding, and it also sets the scene for Sphinx packet construction which 
will be covered in a [follow-up post][sphinx]. Specifically, we answer some 
basic questions such as: "For a node making a payment, how do I find a path to 
the destination node? And how do I communicate to each node on the path what it 
should do?"

By the end of this post, you should understand what information the sender
needs in order to construct a path, what information it must communicate to each
node on that path and how it passes that information on to each node. For this 
last point, this post covers an initial naive approach that will set you up for
understanding why Sphinx packet construction is necessary. 

As per usual, I'll use a long-running example throughout the post.

# Setting the scene

Meet Alice and Dave (don’t stress, Bob will appear later but today is Dave’s 
time to shine) they are two nodes on the Lightning Network.

![](/onion_prelims/1-alice-and-dave.png#center)

Alice wants to pay Dave for a coffee and so Dave generates an invoice and shows 
it to Alice using a QR code.

![](/onion_prelims/2-invoice.png#center)

As you can see, the invoice has some useful information:

- `amount`: the number of milli-satoshis that Dave expects to receive before 
   giving Alice the coffee.
- `payment_hash`: this is the hash that will be used in the HTLC transactions.
- `memo`: a nice little human-readable description of what the payment is for.
- `payee_pub_key`: this is Dave’s public key that would have been announced in 
   his `node_announcement`.
- `min_final_cltv_expiry_delta`: This defines the amount of time (or number of 
   blocks rather) that Dave wants to safety be able to claim the HTLC for this 
   payment before it times out. This will become more clear later on. 

# Finding a path

With invoice in hand, Alice is one step closer to paying Dave. The 
`payee_pub_key` in the invoice tells Alice where to find Dave in the network. 
[Remember][chan-open-post] that Alice will have collected a range of node and 
channel announcements in order to construct a local graph of the network so now 
all she has to do is find Dave in that network and then find paths (via 
channels) that lead to Dave’s node.

![](/onion_prelims/3-graph.png#center)

The diagram above shows Alice’s view of the network along with Dave’s position 
within the network. Apart from the node and channel announcements that Alice 
has received, she would also have received `channel_update` messages from all 
these nodes for each of the channels that they own. The `channel_update` 
messages contain information about the relay policy that that node will enforce 
if other nodes wish to route payments over its channel. Each `channel_update` 
contains the following info:

- `channel_ID`: This identifies the channel that the update is referring to.
- `fee_base_msat`: This is the fee (in milli-satoshis) that the node will 
   charge for routing any payment regardless of the size of the payment.
- `fee_proportional_millionths`: Also known as the “fee rate”, this is the 
   number of satoshis that will be charged for every million satoshis routed 
   across that channel.
- `cltv_expiry_delta`: This is the delta between the incoming HTLC’s CLTV and 
   outgoing HTLC’s CLTV that the node requires (more on this later). 

Here is the updated version of Alice’s graph view showing the `channel_update`
information she has about each channel in her graph.

![](/onion_prelims/4-chan-updates.png#center)

If we narrow down on the current goal which is to pay Dave, we can simplify this 
diagram quite a bit to only show the relevant data. We only care about the 
channels that are on a potential path between Alice and Dave and we only care 
about the `channel_update` from nodes where we will potentially be sending 
across their channel in the outbound direction. For example: Both Bob and 
Charlie have advertised `channel_updates` referring to channel `BC`, but 
because Alice only cares about the direction from Bob to Charlie, she only 
needs to look at the information from Bob's `channel_update` for the channel 
since it always refers to the outgoing direction.

![](/onion_prelims/5-path-choices.png#center)

The above diagram shows the two potential paths from Alice to Bob:

```
1. Alice -> Bob -> Charlie -> Dave via channels AB, BC and CD
2. Alice -> Eve -> Charlie -> Dave via channels AE, EC and CD
```

If Alice is smart, she will pick the path which will cost her the least amount 
of fees. Let’s do some calculations to determine which one would be more 
cost-effective for her.

### Path 1

To work out the total fees for a path, we have to work backwards from the 
destination.

- We know that Dave should be paid 4999999 msats (he said so in his invoice) 
  which means that this is the number of sats that will be routed through 
  Charlie. So the amount of fees to pay to Charlie can be calculated as follows:

```
 = Charlie’s Base Fee + Charlie’s proportional fee in parts per million/1000000 * (The amount routed through Charlie)
 = 100 + 1000/1000000(4999999)  
 = 100 + 4999999000/1000000
 = 100 + 4999.999
 = 5099.99
 ~ 5100
```

So the total number of sats that should be sent to Charlie is: 
```
 = 4999999 + 5100 = 5005099 
 = 5005099 msats
```

- 5005099 msats need to be routed through Bob, so the fee we would need to pay
  to Bob is:
 
```
 = 200 + 2000/1000000(5005099)
 = 200 + 2/1000(5005099)
 = 10211
```

So the total number of sats to send to Bob is:
```
 = 5005099 + 10211
 = 5015310
```

This means that Alice will pay the following amount in fees for the payment:
```
 = 5015310 - 4999999 
 = 15311 msats
```

### Path 2

Alice will do the same type of calculation for the path 2.

- Charlie’s step will be the same: He must be paid a total of 5005099 msats.
- Then we work out what we would need to pay Eve:
 
```
  = 300 + 3000/1000000(5005099)
  = 300 + 3/1000(5005099)
  = 15316 msats
```

So the total number of sats to send to Eve is:
```
  = 5005099 + 15316
  = 5020415 msats
```

Ie, the total that Alice will pay in fees is: 
```
5020415-4999999 = 20416 msats
```

Aaaand the winner is: Path 1! Now we only need care about the following info:

![](/onion_prelims/6-path1.png#center)

# Hop Payloads

Alice now has enough information to know what she wants to communicate to each 
hop along the path.

![](/onion_prelims/7-last-hop-info.png#center)

Alice wants Dave to receive an `update_add_htlc` from Charlie on the `CD` 
channel. The `payment_hash` should match the one specified in the invoice 
received from Dave. The `amount_msat` will be 4999999 as specified in the 
invoice. Alice then also checks the current block height (height 1001) and uses 
that along with the `min_final_cltv_expiry_delta`(9)  in the invoice to 
calculate that the outgoing CLTV value on the HTLC should be 1010.

Using the fee calculation we did earlier for this path, Alice can also determine 
what the `update_add_htlc`s should look like for the Bob-to-Charlie and 
Alice-to-Bob steps. If the fact that the CLTVs for each HTLC increases from 
right to left is confusing, check out [this](#a-note-on-cltv-deltas) quick CLTV 
delta explainer. 

![](/onion_prelims/8-other-hop-info.png#center)

The only part of the puzzle that is missing here is: How does Alice tell 
Charlie what to forward to Dave if she is only connected to Bob? This is where 
the `onion_routing_packet` field in `update_add_htlc` comes in. Alice packages 
up what she wants to tell each node and essentially then wraps it with the 
payload for the previous node. The diagram below should make this more clear:

![](/onion_prelims/9-onion-info.png#center)

So Bob gets the information for him from Alice but also a packet that he should 
forward to Charlie. Charlie gets this packet and reads the data meant for him 
and sees that there is also a payload that he should forward on to Dave. Dave 
gets his payload and sees that he is the final node in the path. At this point, 
Dave will check if he has the pre-image for the incoming payment hash. Note that 
this is where the idea of the "onion" comes in: each hop gets a packet that they 
must "peel" like an onion.

# Naive Onion Packet Construction

Let’s take a moment to imagine what the actual onion packets will look like. 
Heads up here that this is _not_ the final construction. I will build up a 
possible structure here, and then I will explain why this is not the way things 
actually look. The details of how this is actually done will be covered in the 
[next post][sphinx].

Ok so Alice knows what she wants to tell each of the hops. This is called the 
“hop payload”. She puts together the following packet for Bob:

![](/onion_prelims/10-naive-bob-pkt.png#center)

The packet has the following components:
- 1 byte packet version byte
- Alice’s public key
- The payloads for each hop. Note that each payload also has an HMAC which that 
  hop will need to pass the packet on to the next hop (this will be more clear 
  in a moment).
- Finally, an HMAC produced by Alice using her key over the packet’s hop 
  payloads.

(What is an HMAC? I'll explain this better in the next post but for now, just 
think of it as a digital signature used to verify the integrity of a payload)

Bob will receive this packet and will do the following:
1. He will check that the HMAC is valid (in other words he checks that the 
   packet has not been tampered with).
2. He will read the payload meant for him along with the HMAC.
3. He will reconstruct the packet that should be passed on to Charlie. He will 
   append the HMAC given to him by Alice for this packet since he cannot produce 
   this HMAC himself.

![](/onion_prelims/11-naive-charlie-pkt.png#center)

Charlie will receive this packet and do the following:

1. He will check that the HMAC is valid.
2. He will read the payload meant for him along with the HMAC
3. He will reconstruct the packet that should be passed on to Dave:

![](/onion_prelims/12-naive-dave-pkt.png#center)

Dave will receive this packet and do the following:

1. He will check that the HMAC is valid.
2. He will read the payload meant for him along with the HMAC.
3. The HMAC he receives will be an empty byte array. This indicates to Dave that
   he is the final hop.

Ok so what are some issues with this construction?

- Each hop can read the payload for each hop that follows. This leaks who the 
  receiver is.
- Each hop is told Alice’s public key, and so they all know who is sending to 
  the receiver.
- Even if the individual payloads were encrypted, the packet gets smaller and 
  smaller further along the path and so intermediary nodes would be able to 
  guess how far they are away from the final hop based on the packet length.

In other words: privacy = bad. We can’t have that. Enter Sphinx packet 
construction! With Sphinx packet construction:

- Each payload is encrypted so that it can only be decrypted by the node it was 
  meant for.
- The sender does not share their real public key but instead use a different 
  ephemeral key for each hop.
- The packet size remains constant at each hop.

I’ll see you in the next post for all the details on this!

# A note on CLTV Deltas

To understand why nodes advertise a CLTV delta and how this is used by the 
sender of a payment to determine which CLTV to communicate to each hop, let’s 
take a step back and just look at the structure of an HTLC:

![](/onion_prelims/ctlv_delta_1.png#center)

The diagram above shows the HTLC between Charlie and Dave (the last node on the
path). An HTLC has two possible spending paths: The pre-image path which will 
pay the funds to Dave if he is able to produce the pre-image corresponding to 
the payment hash. The other path is the timeout path which will pay the funds 
back to Charlie. This timeout path is only spendable after the block height 
defined by `CLTV A`. Let’s assume that the current block height is 1001. If 
`CLTV A` is 1002, then there is a real chance that just as Dave is about to 
reveal the pre-image to Charlie, block 1002 gets mined and Charlie quickly goes 
ahead and broadcasts the transaction and spends the timeout path before Dave is 
able to sweep the pre-image path. To prevent this race, Dave will want some time 
where he can confidently spend the pre-image path if he needs to before the 
timelock path becomes spendable. He communicates his desired buffer, 9 blocks,  
using the `min_final_cltv_expiry_delta` field of the invoice that he sends to 
Alice. Alice then knows that if she were to send the payment right now while 
the block height is 1001, that Dave will fail any incoming HTLC with a `CLTV A` 
smaller than 1010 (1001 + 9). 

Now, let’s zoom out a bit more and include the HTLC between Bob and Charlie. We 
want to now figure out what an appropriate value would be for the CLTV on the 
HTLC between Bob and Charlie, `CLTV B`.

![](/onion_prelims/cltv_delta_2.png#center)

Let’s assume that Dave waits until the very last minute to reveal the pre-image 
to Charlie. In other words, he waits until just before block 1010 is mined. 
Charlie now needs to turn around and present this pre-image to Bob. In the case 
that Bob goes on-chain with the HTLC, Charlie requires some time where he can 
spend the pre-image path without worrying about Bob being able to spend the 
timeout path. This buffer that Charlie requires between receiving the pre-image 
from Dave and being able to spend the pre-image path safely from the HTLC with 
Bob is Charlie’s CLTV delta. He will advertise this value in his 
`channel_update` and he expects Alice to use that value when constructing her 
payment path. If a payment comes through to Bob and the difference between 
`CLTV_B` and `CLTV_A` value  is less than the delta that he advertised, he will 
fail the payment. He requires that `CLTV_B` be equal to at least `CLTV_A` plus 
his advertised CLTV delta.

# Bonus Section: Hop Hints

This post is a good place to quickly cover what you need to know about hop 
hints and how they affect the process of path finding.

If we go back to the image of Alice’s view of the graph based on the 
`channel_announcement`s that she has received, there is a chance that Alice 
actually doesn’t know about the channel between Charlie and Dave (Channel 
`CD`). This is because it might be a private channel that Charlie and Dave 
chose not to announce to the network.

![](/onion_prelims/13-graph-private-hop.png#center)

In this case, Alice will not be able to find a path to Dave’s node unless he 
provides her with more information in the invoice he sends her. The extra 
information that Dave may provide is made up of one or more “Hop Hints”. These 
hints need to make up for any information that Alice would have received from a 
`channel_announcement` and `channel_update` for the channel. This information 
includes Charlie’s public key, the SCID of the channel and then all the routing 
policy rules for the channel.

![](/onion_prelims/14-invoice-hop-hint.png#center)

The rest of the path finding process is the same :)

# Conclusion

Alrighty! I hope things are making a bit more sense now and that you understand 
both how a sender goes about finding a path to a destination node along with 
what the sender needs to communicate to each node on the path. In the 
[next post][sphinx] we will take a deep dive into exactly how the onion packet 
carrying the hop payloads is constructed to maintain maximum privacy.

[chan-open-post]: ../../posts/open_channel_pre_taproot
[sphinx]: ../../posts/sphinx