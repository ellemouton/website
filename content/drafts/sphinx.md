---
title: "Lightning Network Onion Routing: Sphinx Packet Construction"
summary: "Diving into all things BOLT-04"
date: 2024-03-22
ShowToc: true

cover:
    image: "/onion/cover.png"
---

In the [previous post][onion-prelims], we covered _what_ data we need to 
communicate to each node on a route. Now we will dive into exactly _how_ we 
package up this data so that we leak as little information about the payment as 
possible to hops along the path. This is done using the [Sphinx][bolt-4] packet 
construction which ensures a few things:

 1) Each hop on the path will only know the previous hop and the next hop on the 
path. 
 2) Each hop is only able to decrypt the payload that is meant for it.

In this article, we will work through exactly how this is done. Before we dive 
into the good stuff, however, we first need to cover a few basics. 

# Diffie-Hellman Key Exchange 

[Diffie-Hellman key exchange][dhke] is a simple way for two private key owning 
entities to derive a secret shared key between them. All that the two parties 
need to do is exchange public keys.

![](/onion/2-dhke.png#center)

The diagram above aims to show how this can be done between two parties who own 
keys `A` and `B` respectively. The private keys `a` and `b` remain private and 
yet the two parties are able to derive a shared secret key. To prove to yourself 
that this is indeed a shared secret key, ask yourself if a third party with 
private key `q` and public key `Q` could derive the shared secret between `A` 
and `B` if `Q` had knowledge of both the `A` and `B` public keys. You should be 
able to see that the answer is no.

In Sphinx packet construction, the onion packet creator, Alice, will use a 
shared secret key between a public key that she owns and the public key of each 
node on the path in order to encrypt data for the relevant hop. 

Once a hop has derived the shared secret with Alice, they can then use that 
shared secret along with some constants (`rho`, `mu`, `pad`, `um` and `ammag`) 
to derive other keys or byte streams:

![](/onion/4-key_derivation.png#center)

# Ephemeral Keys

Each hop on the path will need to be told what the public key of the sender is 
so that they can derive the shared secret with the sender and decrypt the 
packet. However, sharing the node level public key of the sender, `A`,  with 
each hop is a bit of a privacy leak. Everyone on the path will know just how 
much Alice is spending on coffee. To prevent this, Alice will instead use an 
ephemeral key with each hop. This means that she will have a new private and 
public key pair for each hop on the path and will use that pair to derive the 
shared secret with the hop’s public key. After the payment is complete, Alice 
can discard this ephemeral key pair.

Naively, Alice could derive a completely new and random key pair for each hop 
along the path but that means she would need to persist each private key while 
the payment completes, _and_ she would need to include the ephemeral public key 
for each hop in the onion packet for that hop. This uses up quite a bit of onion 
packet space.

Instead, what she will do is derive a single ephemeral key pair. The private key 
of this pair is called the `session_key`. Alice uses this key to derive all the 
other ephemeral keys along the path. What is cool about this is that she only 
has to communicate the very first public ephemeral key to the first hop. That 
hop will then be able to use that ephemeral key along with its shared secret 
with Alice to derive the ephemeral key to pass on to the following hop. This 
should become more clear with the long-running example later. 

# HMAC

A [Hash-Based Message Authentication Code (or HMAC)][hmac] is a message 
authentication technique. It is a cryptographic hash function that takes in a 
message to produce the code over along with a secret key. The code is only 
producible and verifiable by parties that have knowledge of the secret key.

HMACs will be used throughout the sphinx packet construction so that each hop 
can verify that the contents of the packet (the message) has not been tampered 
with. Since the HMAC can only be derived by the sender, Alice, each HMAC for 
each hop must be present in the onion from the beginning. This will become more 
clear with the example. 

# XOR

The [XOR][xor] (or Exclusive-OR) operation is a bitwise operation where the 
result is 1 if one _and only one_ of the two bits being operated on is 1. In 
other words, the result of the XOR operation is only 1 if the two bits being 
operated on differ. The XOR truth table can be seen below. It shows the result 
(`C`) after performing the XOR operation on two bits, `A` and `B`, for each of 
the various combinations.

![](/onion/xor-1.png#center)

The next diagram demonstrates an interesting property of XOR that we will be 
making use of in the sphinx packet construction later in this post. It shows 
that taking the result of the above operation, `C`, and XORing it with `A` 
produces `B`. Similarly, the XOR of `C` and `B` produce `A`.

![](/onion/xor-2.png#center)

To really nail down the idea, let’s look at some examples: In example 1 below, 
you can see that if you XOR a packet with itself, it produces a zero byte 
array. So XORing something with itself essentially destroys information. 
Example 2 shows that if you take a packet and XOR it with a zero byte array of 
the same length, then it produces the original packet.

![](/onion/xor-3.png#center)

Ok let’s see some more useful and interesting examples:

![](/onion/xor-4.png#center)

Example 3 shows that if you take a packet and XOR it with a random byte stream, 
then you get the encrypted form of the packet. Example 4 shows that if you then 
take that encrypted packet and once again XOR it with the _same_ byte stream, 
then you are once again left with the clear text. The sphinx packet 
construction makes heavy use of XOR for encrypting a clear text packet using a 
pseudo random byte stream.

# Sender preparation

The example used in this post continues where the last post ended off. 
Basically we have the following route where Alice is the sender and Dave is the 
recipient. Alice essentially just needs to deliver a payload to each hop 
without leaking too much data about the route.

![](/onion/1-path.png#center)

Alice has a set of payloads that she wants to communicate to each hop. When the 
payloads are put into the onion packet, they are prefixed with a length and 
postfixed with a 32 HMAC. 

![](/onion/5-payloads.png#center)

Alice now goes ahead and generates a `session_key` and uses this to derive the 
chain of [ephemeral keys](#ephemeral-keys). Note that "bf" here stands for 
"blinding factor". A blinding factor is used to tweak a private key or public 
key. 

![](/onion/3-ephemeral_keys.png#center)

I mentioned before that we don’t want hops on the route to have an idea of where 
on the route they are. To achieve this, the onion packet given to each hop will 
be the exact same size (1300 bytes) and each hop will only be able to read the 
payload meant for it. The rest of the onion will look like a random stream of 
bytes to that hop.

# First attempt at wrapping the onion. 

We are going to run through the onion wrapping process twice. During the first 
pass we will get an initial feel for it and we will see why certain complexities 
need to be added on the second pass.

Alice needs to wrap the onion back to front: we first add the payload for Dave, 
encrypt that and then add the payload for Charlie and so on. The packet we end 
up giving to Bob will be a fully wrapped onion. Each hop will peel one layer of 
the onion.

First, Alice generates a 1300 byte pseudo random stream using the session key. 
This is knows as the "padding". 

![](/onion/6-padding.png#center)

### Wrapping for Dave

She then slides over the padding to make room for Dave’s payload. The HMAC that 
is appended to Dave’s payload is not actually a real HMAC. Since Dave is the 
last hop, this onion doesn’t need to be passed onto any other hops and so this 
HMAC is made to be an empty set of zero bytes which serves as a signal to Dave 
that he is the final hop on the route.

The packet needs to remain 1300 bytes long and so that trailing section of the 
padding is chopped off.

![](/onion/7-wrap_dave_1.png#center)

Alice then uses her shared key with Dave, $ss_{AD}$, along with the `rho` 
constant to derive a pseudo random stream of 1300 bytes. This stream is XOR'd 
with the onion packet which produces an encrypted packet that only Dave would 
be able to decrypt. Alice then uses $ss_{AD}$, the `mu` constant and the packet 
contents at this point to calculate an HMAC for this packet. Dave will later 
verify that this HMAC is equal to the HMAC that he produces over the packet when 
he receives.

![](/onion/8-wrap_dave_2.png#center)

### Wrapping for Charlie

Next, Alice will add Charlie’s payload. Note that his payload will include the 
$HMAC_1$ calculated above. Once again, the packet length is kept to 1300 bytes. 

![](/onion/9-wrap_charlie_1.png#center)

Similarly to the encryption for Dave, Alice now uses her shared secret with 
Charlie, $ss_{AC}$ to derive a pseudo random byte stream which she XORs with 
the onion packet. This produces the encrypted packet destined for Charlie. Once 
again, Alice calculates an appropriate HMAC for this payload.

### Wrapping for Bob

Ok last layer! Finally, Alice slides Bob’s payload in at the start of the 
packet and clips off the rest so that it is still a 1300 byte packet. She then 
XORs this with a byte stream derived from her shared secret with Bob, $ss_{AB}$,
and then finally calculates the HMAC for this packet: $HMAC_3$.

![](/onion/10-wrap_bob_1.png#center)

Before sending this packet to Bob, Alice wraps it with some required 
information: The packet version byte, Alice’s first ephemeral key $E_{AB}$ and 
finally the HMAC ($HMAC_3$) for the final onion packet.

![](/onion/11-final_onion.png#center)

Alice now hands this packet to Bob. 

# Peeling the Onion

### Bob peels a layer

The first thing that Bob will do is to derive the shared key between him and 
Alice using the ephemeral key, $E_{AB}$. While he is at it, he can also already 
compute the _next_ ephemeral key that he will need to communicate with Charlie.

![](/onion/13-bob_keys.png#center)

Then, Bob needs to validate the HMAC. He does this by using the derived shared 
secret with Alice, $ss_{AB}$, along with the `mu` constant and the onion packet 
contents to compute expected HMAC for the payload. The HMAC is valid if it is 
equal to the one he received from Alice that was appended to the end of the 
packet. 

![](/onion/12-peel_bob_1.png#center)

This HMAC should be valid because you can see that the package contents in the 
above image is the same as the package contents that Alice used to create this 
HMAC.

Great! Now Bob is ready to do some decrypting. Since he was able to derive the 
secret key $ss_{AB}$, he is able to derive the same pseudo random byte stream 
that Alice used to encrypt his payload. He uses this to XOR the payload which 
decrypts it. Oh, but wait! remember that Bob will remove his payload before 
passing it on to Charlie… but the packet needs to remain 1300 bytes long, and he 
can't just replace the empty space with zero bytes since the next hop will be 
able to glean some information about the length of the route and the length of 
Bob’s payload by looking at the number of zero bytes. So instead, before 
decrypting the payload, Bob first appends 1300 zero bytes to the encrypted 
payload, generates  2600 bytes of pseudo random byte stream and only then does 
the XOR decryption. 

![](/onion/14-peel_bob_2.png#center)

Now that the decryption is complete, Bob removes his payload and chops up the 
packet to once again be 1300 bytes:

![](/onion/15-charlie_onion.png#center)

As Alice did for Bob, Bob now packages the onion nicely for Charlie by adding 
the Ephemeral key that Charlie will need along with the $HMAC_2$ that Alice 
provided Bob with in his payload. 

![](/onion/15-onion_for_charlie.png#center)

You may have already picked up an issue here… take a moment here to see if you 
can spot the issue. It will become more clear when we dive into Charlie’s 
verification process in the next step. For now, let’s assume Bob hands this over 
to Charlie. 

### Charlie peels a layer

Charlie receives the packaged onion from Bob. The first thing is does is to use 
the ephemeral key $E_{AC}$ along with his own private key, `c`, to derive the 
shared secret between him and Alice. He then uses this to derive the ephemeral 
key for Dave too.

![](/onion/17-charlie_keys.png#center)

Then, he checks to see if the HMAC is valid given the payload. Ok this is where 
the issue lies! If you scroll back to see the diagram showing the message that 
Alice used to create this HMAC, you will see that the packet looked different. 
But now we at least know what the packet _should_ look like when Alice 
calculates the HMAC for Charlie.

![](/onion/16-peel_charlie_1.png#center)

For the sake of completion _and_ so we can find out where else things might 
have gone wrong, let’s assume that Charlie continues the process.

Charlie uses the shared secret key to decrypt the packet similarly to how Bob 
did it. He then can read his payload and reconstruct the packet for Dave. 

![](/onion/18-peel_charlie_2.png#center)

### Dave peels a layer

Dave receives the packet and derives his shared secret key with Alice:

![](/onion/20-dave_keys.png#center)

He then attempts to do the HMAC verification. Once again, this will fail since 
the packet contents does not match the packet contents that Alice used when 
creating the HMAC. But again, we now know what it should look like, and we will 
use this information on our second attempt. 

![](/onion/19-peel_dave_1.png#center)

Let's again assume that Dave continues and uses the shared secret to decrypt the 
packet.

![](/onion/21-peel_dave_2.png#center)

Dave will see that the HMAC sent to him is a zero byte array. He therefore knows
that he is the last hop on the path.

# Second attempt at wrapping the onion. 

Ok so we’ve made some mistakes, but we have also learned some lessons. Now 
that we know what each packet needs to look like at the time of computing the 
HMACs, we can redo the onion wrapping process correctly.

Let’s start by taking a look at the packet at the point Dave gets it (before 
decryption):

![](/onion/22-filler_1.png#center)

The difference between this packet and the one we originally used to create the 
HMAC is the end bit shown in the diagram above. Luckily we have kept track of 
which pseudo random byte streams and which sections of those byte streams are 
involved here. So all Alice needs to do at the start is to construct this 
section which is called the “filler”. The diagram below shows its construction:

![](/onion/23-filler_2.png#center)

Ok cool! Let’s try this again shall we?

### Wrapping for Dave

The initial padding generation remains the same:

![](/onion/24-padding.png#center)

Again we slide in Dave’s payload and encrypt it:

![](/onion/24-wrap_dave.png#center)

Here is where things change! We know that before Alice uses Dave’s payload to 
compute the HMAC, she must first insert the filler. 

![](/onion/25-wrap_dave_2.png#center)

Great! Now the HMAC that Charlie ends up receiving will in fact be valid for the 
payload he gets. 

### Wrapping for Charlie

Alice then again slides in Charlie’s payload, encrypts it and then… do we need 
to cut out some bytes and replace them with a derived filler again? Well… no, 
it doesn’t seem that we do! Due to the properties of XOR, XORing the packets 
existing filler contents with the byte stream that Charlie uses to decrypt the 
payload, the resulting packet _is_ actually equal to the packet that Charlie 
will receive! Therefore, nothing special needs to be done at this point. Alice 
can go ahead and calculate the HMAC as is. 

![](/onion/26-wrap_charlie_1.png#center)

### Wrapping for Bob

Finally, Alice adds Bob’s payload, encrypts the packet and computes the final 
HMAC. 

![](/onion/27-wrap_bob.png#center)

Notice that this final onion packet is identical to the one that we had at the 
end of the first pass we did (except of course that the HMACs are all correct 
now) and so the peeling of this packet will look exactly like the peeling of the 
first pass packet. 

# Errors

Compared to what we have already covered, understanding how errors are dealt 
with should be a breeze :)

Let’s assume that when Charlie decodes the payload in the onion sent from Alice, 
he realises that she is asking him to forward an amount that would mean that he 
does not get the fee that he has advertised. Charlie will then want to fail the 
payment and so instead of passing the onion on to Dave, he instead constructs a 
failure message packet which will contain a message he wishes to send back to 
Alice telling her what went wrong. He may choose to pad this message too. He 
will use the shared secret he has with Alice, $ss_{AC}$ along with the `um` 
constant to produce an HMAC over the data. He will then use $ss_{AC}$ along with 
the `ammag` constant to produce a pseudo random bytes stream which he will then
XOR with the failure message packet. He will then put this encrypted message in 
an `update_fail_htlc` message and send that back to Bob.

![](/onion/errors-1.png#center)

Bob will simply take his shared secret with Alice, $ss_{AB}$, produce another 
byte stream and re-encrypt the payload as is. He, too, will put this into an 
`update_fail_htlc` message and send it back to Alice.

![](/onion/errors-2.png#center)

When Alice receives this message, she does not immediately know which hop 
produced the payload, but she does know in which order things would have been 
encrypted. So she starts decrypting by un-peeling Bob’s encryption layer. Once 
decrypted, she looks at the first 32 bytes of the payload (the size of an HMAC), 
computes the HMAC for the rest of the payload and checks if those two HMACs are 
equal. In this case, they will not be which means that Bob was not the erring 
node.

![](/onion/errors-3.png#center)

She then continues by peeling back Charlie’s encryption layer and then repeats 
the process of checking the HMAC. In this case, the HMACs will be equal and so 
Alice knows that Charlie is the source of the error, and so she can now read his 
erring reason from the failure message.

![](/onion/errors-4.png#center)

### One little edge case

One edge case to be aware of is where Charlie gets the onion packet from Bob but
then is not able to successfully parse it. If Charlie cannot parse it, then he 
won’t know the ephemeral key to use to derive the shared secret with Alice. This 
means that he would not be able to encrypt a failure message packet. So in this 
case, Charlie will send Bob an `update_fail_malformed_htlc` message with some 
information about the type of error that occurred. When Bob receives this, he 
knows that he must do the initial encryption round for this error. He does this 
and then sends the packet back to Alice in an `update_fail_htlc` message.

# Conclusion

Well if you are still here - congrats! You now understand the complexities 
creating a Sphinx onion packet!

As always, if you think anything needs clarification or if you have any 
questions - leave a comment below. If there are corrections that you think 
should be made to the text, feel free to let me know or to open a pull request 
on the website’s GitHub page.

[onion-prelims]: ../../drafts/onion-routing-prelims
[bolt-4]: https://github.com/lightning/bolts/blob/master/04-onion-routing.md
[dhke]: https://www.techtarget.com/searchsecurity/definition/Diffie-Hellman-key-exchange
[hmac]: https://en.wikipedia.org/wiki/HMAC
[xor]: https://en.wikipedia.org/wiki/XOR_gate