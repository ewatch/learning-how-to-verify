// Die naheliegende Fassung: pro Position abrunden. Sie läuft fehlerfrei, aber
// Dafny verweigert den Beweis, weil die Rundungsreste verloren gehen.
function Sum(s: seq<nat>): nat {
  if |s| == 0 then 0 else Sum(s[..|s| - 1]) + s[|s| - 1]
}

method AllocateNaive(amount: nat, weights: seq<nat>) returns (shares: seq<nat>)
  requires amount <= Sum(weights) && Sum(weights) > 0
  ensures |shares| == |weights|
  ensures Sum(shares) == amount
{
  var total := Sum(weights);
  shares := [];
  var i := 0;
  while i < |weights|
    invariant 0 <= i <= |weights|
    invariant |shares| == i
  {
    shares := shares + [amount * weights[i] / total];
    i := i + 1;
  }
}
