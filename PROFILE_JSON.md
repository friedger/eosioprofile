# What is stored in an account's profile?
## Examples
### Titan profile
Access to profile url: `data.profile.profile_picture_url`
Example from https://labs.eostitan.com/api/v1/account-profiles/all/friedgermuef:

    {
      "eos_account": "friedgermuef",
      "error": "",
      "messages": [
          ""
      ],
      "profile": {
          "display_name": "Friedger",
          "eos_account": "friedgermuef",
          "profile_picture_url": "https://avatars1.githubusercontent.com/u/1449049",
          "short_description": "Android, Blockstack, EOS developer and entrepreneur",
          "social_apps": {
              "github": "friedger"
          },
          "websites": [
              "https://friedger.de"
          ]
      },
      "proxy": {},
      "proxy_vote_share_data": [],
      "status": "ok"
    }

### Blockstack
Access profile url: `data[0].decodedToken.payload.claim.image[0].contentUrl`
Example from https://gaia.blockstack.org/hub/1Maw8BjWgj6MWrBCfupqQuWANthMhefb2v/0/profile.json

    [
      {
        "token": "eyJ....tZ0asGHKckW2b_0Q",
        "decodedToken": {
          "header": {
            "typ": "JWT",
            "alg": "ES256K"
          },
          "payload": {
            "jti": "09160b6c-13e5-46d3-82e2-61f43d057dc7",
            "iat": "2018-08-29T08:08:55.333Z",
            "exp": "2019-08-29T08:08:55.333Z",
            "subject": {
              "publicKey": "035886082cfef6a0ffc5ac6ab1d04006b0b1db943b94be14d5e8903d76bc350ddf"
            },
            "issuer": {
              "publicKey": "035886082cfef6a0ffc5ac6ab1d04006b0b1db943b94be14d5e8903d76bc350ddf"
            },
            "claim": {
              "@type": "Person",
              "@context": "http://schema.org",
              "name": "Friedger Müffke",
              "description": "Entredeveloper in Europe",
              "image": [
                {
                  "@type": "ImageObject",
                  "name": "avatar",
                  "contentUrl": "https://gaia.blockstack.org/hub/1Maw8BjWgj6MWrBCfupqQuWANthMhefb2v/0/avatar-0"
                }
              ],
              "account": [
                {
                  "@type": "Account",
                  "placeholder": false,
                  "service": "twitter",
                  "identifier": "fmdroid",
                  "proofType": "http",
                  "proofUrl": "https://twitter.com/fmdroid/status/927285474854670338"
                },
                {
                  "@type": "Account",
                  "placeholder": false,
                  "service": "facebook",
                  "identifier": "friedger.mueffke",
                  "proofType": "http",
                  "proofUrl": "https://www.facebook.com/friedger.mueffke/posts/10155370909214191"
                },
                {
                  "@type": "Account",
                  "placeholder": false,
                  "service": "github",
                  "identifier": "friedger",
                  "proofType": "http",
                  "proofUrl": "https://gist.github.com/friedger/d789f7afd1aa0f23dd3f87eb40c2673e"
                },
                {
                  "@type": "Account",
                  "placeholder": false,
                  "service": "bitcoin",
                  "identifier": "1MATdc1Xjen4GUYMhZW5nPxbou24bnWY1v",
                  "proofType": "http",
                  "proofUrl": ""
                },
                {
                  "@type": "Account",
                  "placeholder": false,
                  "service": "pgp",
                  "identifier": "5371148B3FC6B5542CADE04F279B3081B173CFD0",
                  "proofType": "http",
                  "proofUrl": ""
                },
                {
                  "@type": "Account",
                  "placeholder": false,
                  "service": "ethereum",
                  "identifier": "0x73274c046ae899b9e92EaAA1b145F0b5f497dd9a",
                  "proofType": "http",
                  "proofUrl": ""
                }
              ],
              "apps": {
                "https://app.graphitedocs.com": "https://gaia.blockstack.org/hub/17Qhy4ob8EyvScU6yiP6sBdkS2cvWT9FqE/",
                "https://www.stealthy.im": "https://gaia.blockstack.org/hub/1KyYJihfZUjYyevfPYJtCEB8UydxqQS67E/",
                "https://www.chat.hihermes.co": "https://gaia.blockstack.org/hub/1DbpoUCdEpyTaND5KbZTMU13nhNeDfVScD/",
                "https://app.travelstack.club": "https://gaia.blockstack.org/hub/1QK5n11Xn1p5aP74xy14NCcYPndHxnwN5y/",
                "https://app.afari.io": "https://gaia.blockstack.org/hub/1E4VQ7A4WVTSXu579xDH8SjJTonfEbR6kL/",
                "https://blockusign.co": "https://gaia.blockstack.org/hub/1Pom8K1nh3c3M6R5oHZMK5Y4p2s2386qVQ/"
              }
            }
          },
          "signature": "FsHth_NMFUVLbgK362hj1jF9WSoT12dO4gp3VpoA-Du5arjVMVqIgB9CpveEWKfOwadVmatZ0asGHKckW2b_0Q"
        }
      }
    ]


## More data 
* BP have already a bp.json
* contracts (accounts) can store their web UIs in their profile
* NFTs contracts can publish their attributes of tokens

### Dappnetwork (https://github.com/bancorprotocol/eos-dapp-network)
    {"enabled": true, "ipfshash":"YourIPFSHash", "name": "App Display Name"}
    {"enabled": true, "appurl":"https://yourappdomain.com", "name": "App Display Name"}
    





