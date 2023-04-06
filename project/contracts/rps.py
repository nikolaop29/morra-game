from pyteal import *
import program

def approval():

    local_opponent = Bytes("opponent") #byteslice
    local_hash_hand = Bytes("hashedhand") #byteslice
    local_real_hand = Bytes("realhand") #byteslice
    local_wager = Bytes("wager") #unit64

    #operations
    op_start = Bytes("start")
    op_accept = Bytes("accept")
    op_resolve = Bytes("resolve")

    @Subroutine(TealType.none)
    def get_ready(account: Expr):
        return Seq(
            App.localPut(account, local_opponent, Bytes("")),
            App.localPut(account, local_hash_hand, Bytes("")),
            App.localPut(account, local_real_hand, Bytes("")),
            App.localPut(account, local_wager, Int(0))
        )
    
    @Subroutine(TealType.uint64)
    def check_if_empty(account: Expr):
        return Return(
            And(
                App.localGet(account, local_opponent) == Bytes(""),
                App.localGet(account, local_hash_hand) == Bytes(""),
                App.localGet(account, local_real_hand) == Bytes(""),
                App.localGet(account, local_wager) == Int(0)
            )
        )
    
    perform_checks = Assert(
        And(
            Global.group_size() == Int(2),

            #check if the current transaction is the first one
            Txn.group_index() == Int(0),

            Gtxn[1].type_enum() == TxnType.Payment,

            Gtxn[1].receiver() == Global.current_application_address(),

            Gtxn[0].rekey_to() == Global.zero_address(),
            Gtxn[1].rekey_to() == Global.zero_address(),

            App.optedIn(Txn.accounts[1], Global.current_application_id()),
        )
    )
    
    #In this case, sender is player A
    @Subroutine(TealType.none)
    def start_game():
        return Seq(
            perform_checks,
            Assert(
                And(
                    #player A
                    check_if_empty(Txn.sender()),
                    #player B
                    check_if_empty(Txn.accounts[1])
                )
            ),
            App.localPut(Txn.sender(), local_opponent, Txn.accounts[1]),
            App.localPut(Txn.sender(), local_hash_hand, Txn.application_args[1]),
            App.localPut(Txn.sender(), local_wager, Gtxn[1].amount()),
            Approve()
        )
    
    #In this case, sender is player B
    @Subroutine(TealType.none)
    def accept_game():
        return Seq(
            perform_checks,
            Assert(
                And(
                    #player B
                    check_if_empty(Txn.sender())
                )
            ),
            App.localPut(Txn.sender(), local_opponent, Txn.accounts[1]),
            App.localPut(Txn.sender(), local_real_hand, Txn.application_args[1]),
            App.localPut(Txn.sender(), local_wager, Gtxn[1].amount()),
            Approve()
        )
    
    @Subroutine(TealType.uint64)
    def transform_hand(hand: Expr):
        return Return(
            Cond(
                [hand == Bytes("rock"), Int(0)],
                [hand == Bytes("paper"), Int(1)],
                [hand == Bytes("scissors"), Int(2)]
            )
        )
    
    @Subroutine(TealType.none)
    def transfer_wager(acc_index: Expr, wager: Expr):
        return Seq(
            InnerTxnBuilder.Begin(),

            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: Txn.accounts[acc_index],
                TxnField.amount: wager
            }),

            InnerTxnBuilder.Submit()
        )
    
    @Subroutine(TealType.none)
    def calc_winner(hand_a: Expr, hand_b: Expr, wager: Expr):
        return Seq(
            If(
                hand_a == hand_b
            )
            .Then(
                Seq(
                    transfer_wager(Int(0), wager),
                    transfer_wager(Int(1), wager)
                )
            )
            .ElseIf(
                (hand_a + Int(1)) % Int(3) == hand_b #player B wins
            )
            .Then(
                transfer_wager(Int(1), wager*Int(2))
            )
            .Else(
                #player A wins
                transfer_wager(Int(0), wager*Int(2))
            )
        )
    
    #This operation is executed by player A
    @Subroutine(TealType.none)
    def resolve_game():
        hand_a = ScratchVar(TealType.uint64)
        hand_b = ScratchVar(TealType.uint64)
        wager = ScratchVar(TealType.uint64)

        return Seq(
            Assert(
                And(
                    Global.group_size() == Int(1),

                    #check if the current transaction is the first one
                    Txn.group_index() == Int(0),

                    Gtxn[0].rekey_to() == Global.zero_address(),

                    #check if wagers are the same
                    App.localGet(Txn.accounts[1], local_wager) == App.localGet(Txn.accounts[0], local_wager),

                    Txn.application_args.length() == Int(2),

                    App.localGet(Txn.sender(), local_hash_hand) == Sha256(Txn.application_args[1])
                )
            ),
            #transform strings to ints
            hand_a.store(transform_hand(Txn.application_args[1])),
            hand_b.store(transform_hand(App.localGet(Txn.accounts[1], local_real_hand))),
            wager.store(App.localGet(Txn.accounts[0], local_wager)),

            calc_winner(hand_a.load(), hand_b.load(), wager.load()),
            Approve()
        )

    return program.event(
        init=Approve(),
        opt_in=Seq(
            get_ready(Txn.sender()),
            Approve()
        ),
        no_op=Seq(
            Cond(
                [Txn.application_args[0] == op_start, start_game()],
                [Txn.application_args[0] == op_accept, accept_game()],
                [Txn.application_args[0] == op_resolve, resolve_game()]
            ),
            Reject()
        )
    )

def clear():
    return Approve()