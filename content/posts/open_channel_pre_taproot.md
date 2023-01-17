---
title: "From `open_channel` to `channel_announcement`"
summary: "A deep dive into opening a Lightning Network channel pre taproot"
date: 2023-01-17
aliases:
  - /open_channel_pre_taproot
---

In this article, I will go over the current process of opening a Lightning
Network channel. I will start with the `channel_open` message and will talk in
detail about it and all the messages involved in “opening” the channel ending
with the `channel_announcement` message. 

The point of this article is to recap the current channel open flow so that a
follow article describing the opening of a taproot
channel[^taproot-channel-proposal] can focus only on the changes that taproot
channels bring to the process.

I previously wrote a [short article on channel opens] but I plan on revamping it
here and diving into it in way more detail and with more diagrams (yay
diagrams!). I will assume that the reader understands the structure of
a commitment transaction and understands why they are asymmetric. If you feel
you are a bit rusty in this area, please check out my articles explaining these
[concepts in detail].

## The end goal

Before we dig into the first step, I think it is useful to illustrate the goal
we are trying to reach. I will once again use our trusty peers, Alice and Bob,
to tell the story. 

Alice and Bob are both Lightning Network nodes. Alice’s node ID (ie, the public
key used to identify her node) is `alice_node_id` and Bob’s node ID is
`bob_node_id`. Their main two goals are: 

1. They want to open a channel between themselves in a trustless way.
2. They want to be able to advertise their new channel so that the rest of the
   network can use it for routing.

## Opening the channel

A channel is opened once both parties have the ability to fully sign their
respective commitment transactions and once the funding transaction is on chain.
Throughout this explanation, I will use diagrams and colours to illustrate the
process. In the diagrams, a white background means that the field of the
transaction is not yet known. A coloured-in field indicates that the field value
is known. Any green fields are used to highlight any of Alice’s public keys or
signatures and any blue fields are used to show Bob’s. 

There are three transactions in play for the opening of a transaction. The first
is the funding transaction which will need to go on chain. The other two are the
first commitment transactions held by Alice and Bob describing the initial state
of the channel.

Here are the diagrams used to describe the three transactions. Note that at the
moment we still don’t know anything about the parameters of the channel and so
all fields still have a white background. Remember that our end goal is to have
all these fields coloured in. 

 ![](/openChanPt1/fntx_1.png#center)
 ![](/openChanPt1/1a_1.png#center)
 ![](/openChanPt1/1b_1.png#center)

### The `open_channel` message

The first step of the process is Alice deciding that she wants to open a channel
with Bob. In doing so, she also becomes the funder of the channel. Let’s say
that Alice decides that she wants to open a 1 BTC channel and wants to
immediately give Bob half of the channel’s capacity (0.5 BTC). Alice will now
put together an `open_channel` message that she will send to Bob. Let’s take a
look at the relevant `open_channel` parameters (I am leaving out any parameters
that don’t have anything to do with the channel-open phase). You can skip this
table if you want. It is just a reference for incase you want to check what the
meaning of a field is.

 ![](/openChanPt1/open_channel_params.png#center)

Let’s now fill in Alice’s values for these fields:

 ![](/openChanPt1/open_chan.png#center)

Alice sends this message over to Bob. 

Since Alice has decided on the type of channel she wants to open (default
channel type) as well as the channel capacity, she can already piece together
quite a large part of the funding transaction:

 ![](/openChanPt1/fntx_2.png#center)

Since she knows the capacity of the channel she wants to open, she can choose
some of her UTXOs to be inputs to the funding transaction. Since Alice does not
yet know which pub key Bob would want to use for the channel, she cannot yet
finalise the channel funding output and hence can also not yet produce
signatures for the inputs.

Since Alice has decided on the channel type (and hence the commitment
transaction structure), she can also start putting together the pieces of the
commitment transactions. If we assume that Bob is delighted by this
channel-opening proposal from Alice, then from this `open_channel` message, he
can also start putting together the pieces. Remember that both parties will need
to construct both commitment transactions since they will both need to be able
to sign their peer’s transactions. Let’s take a look at what pieces they are now
both able to fill in:

 ![](/openChanPt1/1a_2.png#center)

Alice’s commitment transaction has filled in quite nicely. It has the structure
of a default, non-anchor channel transaction and all her public keys have been
filled in (`alice_local_delayed_pk_1` is derived using her
`delayed_payment_basepoint` and her `first_commitment_point`). Since she hasn’t
received any messages from Bob yet, she has not yet been able to fill in any of
his pub keys and since the funding transaction is still incomplete, she also
can’t yet know the TXID to point the input of this commitment transaction to. 

Bob’s commitment transaction (from his perspective) is looking a bit more
complete:

 ![](/openChanPt1/1b_2.png#center)

Like Alice, he also cannot yet fill in the funding transaction’s TXID, but he
can fill in a few other things: 
- The `alice_pubkey_1`, `alice_to_self_delay`, `push_amt` and `local_amt` values
 are taken as is from the `open_channel` message 
- `alice_payment_key_1` is derived using Alice’s `payment_basepoint` and
`first_commitment_point` 
- `revoke_pubkey_1b` is derived using Alice’s `revocation_basepoint` and Bob’s
`first_per_commitment` point (at this point Alice cannot derive this point yet
since she has not received his `first_per_commitment_point`)

Ok cool! Time for Bob to indicate to Alice his acceptance of the request by
sending the next message: `accept_channel`

### The `accept_channel` message

The message shares many of the fields from `open_channel`. Here is the message
that Bob will put together: 

 ![](/openChanPt1/accept_channel.png#center)

When Alice gets this message from Bob, she can now complete the funding
transaction’s output and can create the signatures for the inputs. Since
everything is filled in, the TXID for the funding tx is now also known.

 ![](/openChanPt1/fntx_3.png#center)

Alice can now also further fill in her own commitment transaction:

- she now able to use the values sent by Bob to fill in `bob_pubkey_1`,
`bob_payment_key_1`, `bob_to_self_delay` and `revoke_pubkey_1a`
- since the TXID for the funding tx is now known, she can complete the input too.

She now knows everything she needs to know in order to sign this transaction
herself _but_ she is still missing Bob’s signature for this transaction. 

 ![](/openChanPt1/1a_3.png#center)

Bob’s view of his commitment transaction is still the same as before since he
learned no new info after sending the `accept_channel` message. 

Now that Alice knows the txid for the funding transaction, she is also able to
complete her view of Bob’s commitment transaction and so she can produce her
signature for his transaction. This is where the next message comes in:
`funding_created`. 

### The `funding_created` message

Alice will now use the `funding_created` message to tell Bob the TXID and index
of the funding transaction along with her signature for Bob’s commitment
transaction. Note that he still wont be able to broadcast his transaction since
Alice has not yet broadcast the funding transaction.

 ![](/openChanPt1/funding_created.png#center)

Once the funding message has been received, Bob can fill in the rest of his
commitment transaction:

 ![](/openChanPt1/1b_3.png#center)

Alice won’t broadcast the funding transaction until she has a valid signature
from Bob for her commitment transaction. Enter `funding_signed`:

 ![](/openChanPt1/funding_signed.png#center)

Notice that this is the first message to use the real channel ID instead of the
temporary one. 

This was the last piece of the puzzle for Alice. She now has all the info she
needs to be able to sign her commitment transaction if ever needed. 

 ![](/openChanPt1/a1_4.png#center)

Alice can now safely broadcast the funding transaction. Both she and Bob will
watch the chain for the confirmation of the funding transaction. Once it has
reached the `minimum_depth` specified by Bob in `accept_channel`, both sides
will exchange the `channel_ready` message (previously named `funding_locked`).
This message serves as both a signal to the peer to indicate to them that the
channel is ready for use (and that the channel announcement process can now
start if the peers decided on an announced channel) and also to send across each
peer’s `second_per_commitment_point` that they should use in their second
commitment transaction.

 ![](/openChanPt1/channel_ready.png#center)

Ok cool! We have completed our first goal: Alice and Bob have opened a channel
between themselves in a trust-less way. Now we move on to step 2: announcing
this channel to the network!

## Announcing the channel

This part is fairly painless. Basically there is just one message,
`channel_announcement`, that Alice and Bob need to construct together and once
it is complete, then they can broadcast it to the network. Other nodes will use
this message to prove a few things:

- That the channel funding tx is actually an existing, unspent UTXO with an
acceptable number of confirmations. 
- That the funding transaction output actually looks like a lightning channel
funding transaction
- That the said channel is actually owned by the keys that Alice and Bob say they
used to construct the channel.
- That Alice and Bob both agree on the message being broadcast. 

An incomplete version of the `channel_announcement` message looks as follows:

 ![](/openChanPt1/channel_announcement.png#center)

`h` is the hash of all the data that will be covered by the signatures. In order
to complete the message, Alice and Bob both compute a signature over `h` using
the private keys associated with their node IDs and the pubkeys they used in the
funding transaction. They then both exchange the `announcement_signatures`
message in order to communicate these signatures to each other:

 ![](/openChanPt1/announcement_sigs.png#center)

Now both nodes can put together the complete `channel_announcement` message:

 ![](/openChanPt1/channel_announcement_2.png#center)

Let’s go over the steps that a node (Charlie) receiving this message will go
through in order to verify the new channel that Alice and Bob claimed to have
opened. 

1. First, Charlie will use the `short_channel_id` included in the message to make sure
that the channel’s funding transaction actually exists on-chain, that it has a
sufficient number of confirmations and that it is in fact unspent. 
2. Then, Charlie will also check that the unspent output actually does look like a
Lightning channel owned by `alice_pubkey_1` and `bob_pubkey_1`. He will do this
by using the advertised pubkeys to reconstruct the P2WSH and ensure that it is
the same as the one found on-chain. 
3. Now, Charlie will want to confirm that the nodes owning the pubkeys found in the
channel funding output do in fact belong to the nodes owning the node ID
pubkeys. This is done by verifying the `alice_pubkey_1_sig` and
`bob_pubkey_1_sig` signatures. If these signatures are valid, then it is clear
that the owners of `alice_pubkey_1` and `bob_pubkey_1` agree to being associated
with `alice_node_ID` and `bob_node_ID` since the message signed includes these
nodes IDs. 
4. Finally, Charlie will also want to ensure that owners of the node ID pubkeys
agree to being associated with the new channel. This is done by verifying the
`alice_node_ID_sig` and `bob_node_ID_sig` signatures. If these signatures are
valid, then it is clear that the owners of `alice_node_ID_sig` and
`bob_node_ID_sig` agree to being associated with `alice_pubkey_1` and
`bob_pubkey_1` since the message signed includes these pubkeys.

Alice and Bob are done! Their channel is open and other nodes in the network,
like Charlie, will happily use the new channel. 

In the next post, I will dive into how the above process will change with
taproot channels (given the current proposal). The main thing that will need to
change is how signatures are dealt with. In all the above cases, Alice and Bob
didn't really need to do anything special when they were generating their
signatures since they each would need to provide their own signature to sign for
the 2-of-2 funding transaction. But with taproot, the funding output will use
Musig2 to combine the pubkeys of Alice and Bob and so any signatures will need
to involve the Musig2 signing protocol… But let’s leave the details of that for
next time :)

[short article on channel opens]:  ../creating-a-channel
[concepts in detail]: ../updating-state

[^taproot-channel-proposal]: https://github.com/lightning/bolts/pull/995
