from pyteal import *
import program

def approval():

    local_opponent = Bytes("opponent") #byteslice
    local_hash_fingers = Bytes("hashedfingers") #byteslice
    local_real_fingers = Bytes("realfingers") #byteslice
    local_hash_guess = Bytes("hashedguess") #byteslice
    local_real_guess = Bytes("realguess") #byteslice
    local_wager = Bytes("wager") #uint64

    #operations
    op_start = Bytes("start")
    op_accept = Bytes("accept")
    op_resolve = Bytes("resolve")

    @Subroutine(TealType.none)
    def get_ready(account: Expr):
        return Seq(
            App.localPut(account, local_opponent, Bytes("")),
            App.localPut(account, local_hash_fingers, Bytes("")),
            App.localPut(account, local_real_fingers, Bytes("")),
            App.localPut(account, local_hash_guess, Bytes("")),
            App.localPut(account, local_real_guess, Bytes("")),
            App.localPut(account, local_wager, Int(0))
        )
    
    @Subroutine(TealType.uint64)
    def check_if_empty(account: Expr):
        return Return(
            And(
                App.localGet(account, local_opponent) == Bytes(""),
                App.localGet(account, local_hash_fingers) == Bytes(""),
                App.localGet(account, local_real_fingers) == Bytes(""),
                App.localGet(account, local_hash_guess) == Bytes(""),
                App.localGet(account, local_real_guess) == Bytes(""),
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
            App.localPut(Txn.sender(), local_hash_fingers, Txn.application_args[1]),
            App.localPut(Txn.sender(), local_hash_guess, Txn.application_args[2]),
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
            App.localPut(Txn.sender(), local_real_fingers, Txn.application_args[1]),
            App.localPut(Txn.sender(), local_real_guess, Txn.application_args[2]),
            App.localPut(Txn.sender(), local_wager, Gtxn[1].amount()),
            Approve()
        )
    
    @Subroutine(TealType.uint64)
    def transform(number: Expr):
        return Return(
            Cond(
                [number == Bytes("0"), Int(0)],
                [number == Bytes("1"), Int(1)],
                [number == Bytes("2"), Int(2)],
                [number == Bytes("3"), Int(3)],
                [number == Bytes("4"), Int(4)],
                [number == Bytes("5"), Int(5)],
                [number == Bytes("6"), Int(6)],
                [number == Bytes("7"), Int(7)],
                [number == Bytes("8"), Int(8)],
                [number == Bytes("9"), Int(9)],
                [number == Bytes("10"), Int(10)]
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
    def calc_winner(fingers_a: Expr, fingers_b: Expr, guess_a: Expr, guess_b: Expr, wager: Expr):
        return Seq(
            If(
                guess_a == guess_b
            )
            .Then(
                Seq(
                    transfer_wager(Int(0), wager),
                    transfer_wager(Int(1), wager)
                )
            )
            .ElseIf(
                (fingers_a + fingers_b) == guess_a #player A wins
            )
            .Then(
                transfer_wager(Int(0), wager*Int(2))
            )
            .ElseIf(
                (fingers_a + fingers_b) == guess_b #player B wins
            )
            .Then(
                transfer_wager(Int(1), wager*Int(2))
            )
            .Else(
                Seq(
                    transfer_wager(Int(0), wager),
                    transfer_wager(Int(1), wager)
                )
            )
        )
    
    #This operation is executed by player A
    @Subroutine(TealType.none)
    def resolve_game():
        fingers_a = ScratchVar(TealType.uint64)
        fingers_b = ScratchVar(TealType.uint64)
        guess_a = ScratchVar(TealType.uint64)
        guess_b = ScratchVar(TealType.uint64)
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

                    Txn.application_args.length() == Int(3),

                    App.localGet(Txn.sender(), local_hash_fingers) == Sha256(Txn.application_args[1]),

                    App.localGet(Txn.sender(), local_hash_guess) == Sha256(Txn.application_args[2])
                )
            ),
            #transform strings to ints
            fingers_a.store(transform(Txn.application_args[1])),
            fingers_b.store(transform(App.localGet(Txn.accounts[1], local_real_fingers))),
            guess_a.store(transform(Txn.application_args[2])),
            guess_b.store(transform(App.localGet(Txn.accounts[1], local_real_guess))),
            wager.store(App.localGet(Txn.accounts[0], local_wager)),

            calc_winner(fingers_a.load(), fingers_b.load(), guess_a.load(), guess_b.load(), wager.load()),
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