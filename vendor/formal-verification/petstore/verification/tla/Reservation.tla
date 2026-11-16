---------------------------- MODULE Reservation ----------------------------
(* Das Bestellprotokoll aus src/domain/checkout.ts und server/store.ts.        *)
(* Jeder Käufer reserviert die Tiere seines Warenkorbs einzeln, weil die       *)
(* Petstore-API pro Bestellung nur ein Tier kennt.                             *)
(*                                                                             *)
(* ServerChecks = FALSE: Der Client prüft erst, dann bestellt er. So arbeitet  *)
(*                       das Original-Petstore, dessen Server nicht prüft.     *)
(* Compensate   = FALSE: Bei einem Konflikt bleiben Reservierungen liegen.     *)
EXTENDS Naturals, Sequences, FiniteSets

CONSTANTS ServerChecks, Compensate

Buyers == {"anna", "ben"}
Pets == {"rex", "luna"}
Cart == [b \in Buyers |-> IF b = "anna" THEN <<"rex", "luna">> ELSE <<"luna", "rex">>]

VARIABLES
    pc,        \* Käufer: "shopping", "ordering", "rollback", "confirmed", "failed"
    position,  \* Käufer: Index des aktuellen Tiers im Warenkorb
    held,      \* Käufer: Tiere, für die er eine Bestellung hält
    owners     \* Tier: Käufer mit einer Bestellung für dieses Tier

vars == <<pc, position, held, owners>>

Current(b) == Cart[b][position[b]]
Free(p) == owners[p] = {}

Init ==
    /\ pc = [b \in Buyers |-> "shopping"]
    /\ position = [b \in Buyers |-> 1]
    /\ held = [b \in Buyers |-> {}]
    /\ owners = [p \in Pets |-> {}]

\* Nur ohne Serverprüfung: Der Client liest den Status in einem eigenen Schritt.
ClientCheck(b) ==
    /\ ~ServerChecks
    /\ pc[b] = "shopping"
    /\ pc' = [pc EXCEPT ![b] = IF Free(Current(b)) THEN "ordering" ELSE "rollback"]
    /\ UNCHANGED <<position, held, owners>>

\* Ein einzelner POST /store/order. Mit Serverprüfung ist das eine atomare
\* Aktion, siehe placeOrder in server/store.ts.
Reserve(b) ==
    LET p == Current(b)
        allowed == ~ServerChecks \/ Free(p)
        ready == IF ServerChecks THEN pc[b] = "shopping" ELSE pc[b] = "ordering"
        last == position[b] = Len(Cart[b])
    IN /\ ready
       /\ IF allowed
          THEN /\ owners' = [owners EXCEPT ![p] = @ \cup {b}]
               /\ held' = [held EXCEPT ![b] = @ \cup {p}]
               /\ pc' = [pc EXCEPT ![b] = IF last THEN "confirmed" ELSE "shopping"]
               /\ position' = [position EXCEPT ![b] = IF last THEN @ ELSE @ + 1]
          ELSE /\ pc' = [pc EXCEPT ![b] = "rollback"]
               /\ UNCHANGED <<position, held, owners>>

\* Ein einzelner DELETE /store/order/{id}.
Rollback(b) ==
    /\ pc[b] = "rollback"
    /\ IF Compensate /\ held[b] /= {}
       THEN \E p \in held[b]:
            /\ owners' = [owners EXCEPT ![p] = @ \ {b}]
            /\ held' = [held EXCEPT ![b] = @ \ {p}]
            /\ UNCHANGED <<pc, position>>
       ELSE /\ pc' = [pc EXCEPT ![b] = "failed"]
            /\ UNCHANGED <<position, held, owners>>

Finished == \A b \in Buyers: pc[b] \in {"confirmed", "failed"}

Next ==
    \/ \E b \in Buyers: ClientCheck(b) \/ Reserve(b) \/ Rollback(b)
    \/ Finished /\ UNCHANGED vars

Spec == Init /\ [][Next]_vars /\ WF_vars(\E b \in Buyers: ClientCheck(b) \/ Reserve(b) \/ Rollback(b))

\* Kein Tier gehört zwei Käufern.
NoDoubleSale == \A p \in Pets: Cardinality(owners[p]) <= 1

\* Wer gescheitert ist, blockiert kein Tier mehr.
NoLeak == \A b \in Buyers: pc[b] = "failed" => held[b] = {}

\* Wer bestätigt ist, hat seinen ganzen Warenkorb.
ConfirmedComplete == \A b \in Buyers:
    pc[b] = "confirmed" => held[b] = {Cart[b][i] : i \in 1..Len(Cart[b])}

\* Jeder Bestellvorgang endet.
Termination == <>Finished
=============================================================================
