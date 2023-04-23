---
title: "Taproot Channel Transactions"
summary: "A deep-dive into the structure of Taproot channel transactions"
date: 2023-04-23

cover:
    image: "/taprootChanTxs/taproot-chans-cover.png"
---

Hold on to your hats folks, things are about to get real. 

# Overview

In this post, I will dive into the structure of Taproot channel funding and
commitment transactions. If you missed my [previous post][taproot-prelims] about
Taproot and MuSig2, it might be a good idea to read that one first for a recap
of the building blocks that will be used throughout this post. If you perhaps
also need a re-cap of the general structure of commitment transactions then
check out [this][htlc-deep-dive] post where I cover why each output in a
commitment transaction looks the way it does.

Note that Taproot Channels are still in the design phase and so until
the [proposal][tap-chan-bolt-pr] by the one and only [Roasbeef][roasbeef] is
merged, this blog post will be a living document that I will update if any
changes are made to the proposal. There are currently even a few open questions
in the proposal which I will try to illustrate here.

If you have read some of my previous blog posts, you might have noticed that I
love to make use of diagrams. Well this post is diagrams on steroids. To help
with understanding, here is a legend showing what each colour generally 
represents:

![](/taprootChanTxs/colour-legend.png#center)

Ok, ready? Let's dive in!

# Funding Transaction Output

Here is a diagram showing how a Taproot-channel funding output is constructed: 

![](/taprootChanTxs/funding-output.png#center)

The two parties in a channel, the local and remote peer, use the MuSig2
protocol to aggregate their individual funding keys, `P_a` and `P_b`, into the
aggregate key, `P_agg`, which is also the internal key. This internal key is
then tweaked with a BIP86 tweak. You might recall from the previous post that a
BIP86 tweak gives the channel owners the ability to prove to other nodes on the
network that this funding output does not have a hidden script path. 

## Spending from the funding transaction

The funding output can only ever be spent via the key path. Since the internal
key is an aggregate key produced via MuSig2, to spend it requires both parties
to produce partial signatures for the message being signed. These signatures are
then aggregated using the MuSig2 `PartialSigAgg` function and finally tweaked
with the tweak, `T`, to produce the signature that would validly spend the
funding output.

![](/taprootChanTxs/funding-keypath.png#center)

# Commitment Transaction Outputs

There are six different outputs that a commitment transaction can have. These
are: the `to_local` and `to_remote` outputs, the local and remote anchor
outputs, the offered htlc output and the accepted htlc output. Let’s dive in. 

## The `to_local` output

The `to_local` output is responsible for paying the local peer all the funds in
the channel that belong to them that are not currently committed to an HTLC. The
output must be revocable by the remote party and then only after `to_self_delay`
blocks should the local party be able to spend from the output. The revocation
key is used as the internal key and the to-local delayed script is then placed
in the TapTree.

![](/taprootChanTxs/to-local-output.png#center)

### Key path spend

The revocation key which will only be spendable by the remote peer _iff_ the
state associated with this commitment transaction has been revoked (see more on
revocation “here”) . Thus, if the local party tries to cheat the remote party by
publishing an old state, the remote party will be able to sweep via the key
spend path which also the most cost effective spending path.

![](/taprootChanTxs/to-local-key-path.png#center)

### Script path spend

If this commitment transaction ends up on-chain as part of an honest force-close
scenario then the remote party will not be able to spend via the revocation key.
In this case, the transaction will be spendable by the local party via the
script path after `to_self_delay` blocks have been confirmed. The following
diagram shows the witness that will be required to spend this path:

![](/taprootChanTxs/to-local-script-spend.png#center)

It contains a witness script for the local-delayed script. This witness only
requires a valid signature from the local party. The script itself must also be
revealed and finally, the control block must be specified. In this case, it only
contains the parity bit of `to_local` output’s output key along with the
internal key. Note that no inclusion proof needs to be included in the control
block since there is only one script in the TapTree which means that the script
root can be calculated straight from the local-delayed script.

## The `to_remote` output

This output pay’s the remote party their channel balance. As with all anchor
channels, all non-anchor outputs must have a CSV of at least 1 so as to not
break the CPFP-carveout rule. Therefore, the remote party is only allowed access
to their funds after one confirmation. This type of requirement can only be
added in a script and so this output also makes use of the TapTree.

![](/taprootChanTxs/to-remote-output.png#center)

At this point, you are likely wondering about the internal key. We only require
one spend path for this output but unfortunately we had to put it in the
TapTree. We still have to set an internal key, however, even though we don’t
ever want anyone to be able to spend from it. From the diagram you can see that
the spec currently sets this key to the same aggregate public key used in the
funding transaction. The idea here being that if `P_agg` internal key, then we
know that it would require cooperation among the two peers to spend via this key
but there is really no reason for either party to want to do so. This
effectively cancels out the key path.

Some [reviewers]() of the proposal have noted that using `P_agg` as the internal
key here makes recovery for the remote peer basically impossible if they find
them selves in a situation where they have lost all channel data, all channel
backups and only have their master seed left. With legacy channels, remote
parties who have lost all their channel data are still able to scan the chain
for `to_remote` outputs that belong to them since they know the derivation path
that would be used for deriving these keys. This property will be lost
if `P_agg` is used as the internal key in the Taproot channel case because the
remote party would not be able to derive it and thus would not be able to scan
the chain for their outputs. It has therefore been suggested that instead of
using `P_agg` here, that a public NUMS point be used instead. If a public NUMS
point is used, then the remote nodes will once again retain the ability to scan
the chain for `to_remote` outputs belonging to them.

### Script path spend

Once the commitment transaction has one confirmation, the remote peer can spend
it via the script path using the following witness:

![](/taprootChanTxs/to-remote-script-path.png#center)

## Remote Anchor Output

This is the output that the remote party will be able to use to CPFP the
commitment transaction if required. The remote party’s public key is thus used
as the internal key. To ensure that this output (a very small output of only 330
satoshis) is definitely cleaned up at some point from the UTXO set, another
output path is added which allows anyone to spend the output after it has been
confirmed for 16 blocks. This extra path is added as a script in the TapTree.

![](/taprootChanTxs/remote-anchor-output.png#center)

### Key path spend

The key spend path just requires a signature from the remote party which they
will tweak with the TapTweak.

![](/taprootChanTxs/remote-anchor-key-path.png#center)

### Script path spend

Once the output has been confirmed for 16 blocks, it becomes fair game. Anyone
is allowed to spend from this output as long as they can produce the following
spending script:

![](/taprootChanTxs/remote-anchor-script-path.png#center)

Notice anything here? If you were a third party trying to sweep some expired
anchor outputs for some free sats, would you be able to produce the above
spending script? The answer is: yes, but only if you know what `P_remote` is!
Before reading on, I suggest taking some time to think about how you could
possibly come to know what `P_remote` is. It is not present in the funding
transaction, nor is it present in the commitment transaction. Scroll up through
the diagrams to see if you can see where it revealed.

Ok ready? It is only revealed if the `to_remote` output is spent as it appears
in the witness required to spend that output. This means that the remote anchor
is spendable by anyone after 16 blocks only when the `to_remote` output has been
spent.

## Local Anchor Output  

This is the output that you, the local party, will be able to use to CPFP the
commitment transaction. And just like the remote anchor, it is spendable by
anyone after 16 blocks. So the internal key is `P_local_delayed` and the “anyone
can spend after 16 blocks” script is put in the TapTree.

![](/taprootChanTxs/local-anchor-output.png#center)

### Key path spend

The key spend path just requires a signature from the local party which they
will tweak with the TapTweak.

![](/taprootChanTxs/local-anchor-key-spend.png#center)

### Script path spend

Just like the remote anchor, the parties wanting to spend via the “anyone can
spend” path require the `P_local_delayed` public key to first be revealed. This
is revealed when the `to_local` output is spent by the local party via the
script path.

![](/taprootChanTxs/local-anchor-script-path.png#center)

There is, however, one very important difference between the `to_local`
and `to_remote` output: the `to_remote` output can only be spent via the script
path which means that `P_remote` is always revealed. However, the `to_local`
output can be spent via two paths! In the ideal case, it is spent via the script
path in which case the `P_local_delayed` is revealed and there is no issue. But
in the bad case, the `to_local` output is spent via the revocation path in which
case `P_local_delayed` will not be revealed. In that case only the two channel
peers would ever have the information required to spend the local anchor.

An alternative that has been suggested is that the `to_local` output be changed
so as to force the reveal of `P_local_delayed` no matter how it is spent. This
could be done by changing the keyspend path to be a public NUMS point and then
moving the revocation path to the TapTree and adjusting the script so that
the `P_local_delayed` key is embedded in it so that it must be revealed if the
revocation path is spent. The down side here is that this increases the spend
cost of both output paths of the `to_local` output. The question comes down to
how much we want to cater for this very rare edge case. 

## Offered HTLC Output

An offered HTLC pays out to the remote party if they reveal the pre-image to a
given hash before a certain CLTV timeout. After the timeout, the local party
will be able to claim the output via the htlc-timeout transaction (details on
that below). If the commitment transaction is a revoked state, then the remote
party should be able to sweep the output at any time.

![](/taprootChanTxs/offered-htlc-output.png#center)

### Key path spend

The internal key is set to the revocation key which is spendable only by the
remote party and only if the commitment transaction is for a revoked state. If
this is the case, then the remote party can sweep the output with the following
signature:

![](/taprootChanTxs/offered-htlc-key-spend.png#center)

### Script path spends

The other two spend paths, the success and timeout paths, are placed in the
TapTree and spending either of them requires providing a valid witness for the
script, the script itself and a control block which this time does include an
inclusion proof since more than one script is present in the TapTree. 

#### Success Path

To spend via the success path, the following witness is required.

![](/taprootChanTxs/offerend-htlc-success.png#center)

#### Timeout Path

The following witness is required to spend via the timeout path. Transaction
spending the timeout path is the htlc-timeout transaction. More details on that
transaction later on. If you need a recap on the reason why second-stage htlc
transactions are necessary, check out [this] post. 

![](/taprootChanTxs/offered-htlc-timeout.png#center)

## Accepted HTLC Output

The accepted HTLC output pays out to an htlc-success transaction if we (the
local party) are able to provide the pre-image for the given payment hash.
Otherwise, after a certain `cltv_expiry`, the remote party will be able to sweep
the funds back. If the commitment transaction is a revoked state, then the
remote party should be able to sweep the output at any time.

![](/taprootChanTxs/accepted-htlc-output.png#center)

### Key path spend

The internal key is set to the revocation key which is spendable only by the
remote party and only if the commitment transaction is for a revoked state. If
this is the case, then the remote party can sweep the output with the following
signature:

![](/taprootChanTxs/accepted-htlc-key-path.png#center)

### Script path spends

The other two spend paths, the success and timeout paths, are placed in the
TapTree and spending either of them requires providing a valid witness for the
script, the script itself and a control block which this time does include an
inclusion proof since more than one script is present in the TapTree.

#### Success Path

To spend via the htlc-success transaction, the following witness must be
provided:

![](/taprootChanTxs/accepted-htlc-success.png#center)

#### Timeout Path

To spend via the timout path, the remote party must provide the following
witness:

![](/taprootChanTxs/accepted-htlc-timeout.png#center)

## HTLC Timeout and Success Transactions

The htlc-timeout and htlc-success transactions look mostly identical so here is
one diagram to describe both: 

![](/taprootChanTxs/htlc-txs.png#center)

The only difference between the htlc-success and htlc-timeout transactions would
be the inputs they are spending and hence, the witness required for spending
that input. The htlc-timeout transaction spends the timeout path of the offered
HTLC output and the htlc-success transaction spends the success path of the
accepted HTLC output.

The outputs of the htlc-success and htlc-timeout transactions are identical:
they are immediately spendable by the remote party via the revocation path if
the associated commitment transaction is for a revoked state. Otherwise, they
are spendable by the local party after `to_self_delay` blocks have been
confirmed.

The key path and script path spend scripts are exactly the same as for
the `to_local` output.

[taproot-prelims]: ../../posts/taproot-prelims
[htlc-deep-dive]: ../../posts/htlc-deep-dive
[tap-chan-bolt-pr]: https://github.com/lightning/bolts/pull/995
[roasbeef]: https://twitter.com/roasbeef