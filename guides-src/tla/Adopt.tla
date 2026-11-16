---- MODULE Adopt ----
EXTENDS Naturals, FiniteSets

People == {"anna", "ben"}

VARIABLES pc, reservedBy
vars == <<pc, reservedBy>>

Init == /\ pc = [p \in People |-> "idle"]
        /\ reservedBy = {}

\* Step 1: the app checks whether Rex is still free.
Check(p) == /\ pc[p] = "idle"
            /\ pc' = [pc EXCEPT ![p] = IF reservedBy = {} THEN "sawFree" ELSE "done"]
            /\ UNCHANGED reservedBy

\* Step 2: later, in a separate request, it reserves Rex.
Reserve(p) == /\ pc[p] = "sawFree"
              /\ reservedBy' = reservedBy \cup {p}
              /\ pc' = [pc EXCEPT ![p] = "done"]

Finished == /\ \A p \in People : pc[p] = "done"
            /\ UNCHANGED vars

Next == (\E p \in People : Check(p) \/ Reserve(p)) \/ Finished
Spec == Init /\ [][Next]_vars

\* The rule we care about: Rex is never reserved by two people.
OnlyOneOwner == Cardinality(reservedBy) <= 1
====
