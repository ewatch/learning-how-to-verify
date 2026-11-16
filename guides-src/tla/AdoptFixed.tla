---- MODULE AdoptFixed ----
EXTENDS Naturals, FiniteSets

People == {"anna", "ben"}

VARIABLES pc, reservedBy
vars == <<pc, reservedBy>>

Init == /\ pc = [p \in People |-> "idle"]
        /\ reservedBy = {}

\* One atomic step: the server checks and reserves in the same transaction.
CheckAndReserve(p) == /\ pc[p] = "idle"
                      /\ reservedBy' = IF reservedBy = {} THEN {p} ELSE reservedBy
                      /\ pc' = [pc EXCEPT ![p] = "done"]

Finished == /\ \A p \in People : pc[p] = "done"
            /\ UNCHANGED vars

Next == (\E p \in People : CheckAndReserve(p)) \/ Finished
Spec == Init /\ [][Next]_vars

OnlyOneOwner == Cardinality(reservedBy) <= 1
====
