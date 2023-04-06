#!/usr/bin/env bash

# APPLICATION ID = 53
# APPLICATION ACCOUNT = "KRI4UNYE3S6H4OC3T3I2JPG4475D7AJNXGQJKWWBEBJW7KJSBMWTY3R5MM"
# CHALLENGER ACCOUNT = "IAEP3WXYZTAG6CMEJNTFNIQXDK67PUR5DKGLBDOWTGBLZNEA5OGPBMPEF4"
# CHALLENGER HASH = "NDkzYTE1ZTdiZGE4OGIwNzI3MjA3MWNiY2ZkM2NiMDU5MjBiOTk5ODcyYjZmM2NmYTZlNGQxNjcxMmRiZjQzNA=="
# CHALLENGER HAND ="scissors"
# OPPONENT ACCOUNT = "P3PLNEUIRGEZRBHLNLLOIIHAMOFFTN365JJ7CDPCMQKK4BIPB7U7WFYYJU"
# OPPONENT HAND = "rock"
# WAGER = 10000

goal app call \
    --app-id 20 \
    -f DERNUHFMWIRXSZKPRYRGEE63ZP4KYS4FL3T6QOVPJVGDYQIMB35DHXZA4M \
    --app-account MRYUJQDFUCMNRVSC74U664O6FAO36TUBISUWVKMYMTVF22RUVXZPUZJS4I \
    --app-arg "str:start" \
    --app-arg "b64:NQp3DA7J81PhpWKYlfN0/aopmHbDhwwD/rYOtKN2nZQ=" \
    -o play-start.tx

goal clerk send \
    -a 100000 \
    -t H6BBCRN4QVZCFSF4DQ7TT36GX66BJZTMLVK3ORJ6W5MXBQELQGPFB2XYGE \
    -f DERNUHFMWIRXSZKPRYRGEE63ZP4KYS4FL3T6QOVPJVGDYQIMB35DHXZA4M \
    -o play-wager.tx

cat play-start.tx play-wager.tx > play-combined.tx
goal clerk group -i play-combined.tx -o play-grouped.tx
goal clerk split -i play-grouped.tx -o play-split.tx

goal clerk sign -i play-split-0.tx -o play-signed-0.tx
goal clerk sign -i play-split-1.tx -o play-signed-1.tx

cat play-signed-0.tx play-signed-1.tx > play-signed-final.tx

goal clerk rawsend -f play-signed-final.tx