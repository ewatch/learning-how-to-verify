// Beweist die Rabattverteilung aus src/domain/allocate.ts für ALLE Eingaben:
// exakte Summe, und kein Anteil übersteigt sein Gewicht.
//
// Der Beweis gilt für dieses Dafny-Programm. Dass die TypeScript-Fassung
// dasselbe rechnet, prüft test/differential/dafny.differential.test.ts gegen
// den aus dieser Datei erzeugten Code.
module Allocation {
  function Sum(s: seq<nat>): nat {
    if |s| == 0 then 0 else Sum(s[..|s| - 1]) + s[|s| - 1]
  }

  lemma SumAppend(s: seq<nat>, x: nat)
    ensures Sum(s + [x]) == Sum(s) + x
  {
    assert (s + [x])[..|s|] == s;
  }

  lemma SumPrefixBound(s: seq<nat>, i: nat)
    requires i <= |s|
    ensures Sum(s[..i]) <= Sum(s)
    decreases |s| - i
  {
    if i < |s| {
      SumPrefixBound(s, i + 1);
      assert s[..i + 1][..i] == s[..i];
    } else {
      assert s[..i] == s;
    }
  }

  lemma DivMonotone(a: nat, b: nat, t: nat)
    requires t > 0 && a <= b
    ensures a / t <= b / t
  {
    if a / t > b / t {
      var qa, qb := a / t, b / t;
      assert a == t * qa + a % t;
      assert b == t * qb + b % t;
      assert qa >= qb + 1;
      assert t * qa >= t * (qb + 1) == t * qb + t;
    }
  }

  lemma DivAddMultiple(x: nat, w: nat, t: nat)
    requires t > 0
    ensures (x + t * w) / t == x / t + w
  {
    var q := x / t;
    var r := x % t;
    assert x == t * q + r;
    assert x + t * w == t * (q + w) + r;
    DivUnique(x + t * w, t, q + w, r);
  }

  lemma DivUnique(n: nat, t: nat, q: nat, r: nat)
    requires t > 0 && 0 <= r < t && n == t * q + r
    ensures n / t == q
  {
    var q2, r2 := n / t, n % t;
    assert n == t * q2 + r2;
    if q2 > q {
      assert t * q2 >= t * (q + 1) == t * q + t;
    } else if q2 < q {
      assert t * q >= t * (q2 + 1) == t * q2 + t;
    }
  }

  // Der Kern: Der Sprung der kumulierten Rundung ist nie größer als das Gewicht.
  lemma ShareBounds(amount: nat, cumulative: nat, weight: nat, total: nat)
    requires total > 0 && amount <= total
    ensures amount * cumulative / total <= amount * (cumulative + weight) / total
    ensures amount * (cumulative + weight) / total - amount * cumulative / total <= weight
  {
    var x := amount * cumulative;
    assert amount * (cumulative + weight) == x + amount * weight;
    assert amount * weight <= total * weight;
    DivMonotone(x, x + amount * weight, total);
    DivMonotone(x + amount * weight, x + total * weight, total);
    DivAddMultiple(x, weight, total);
  }

  method Allocate(amount: nat, weights: seq<nat>) returns (shares: seq<nat>)
    requires amount <= Sum(weights)
    ensures |shares| == |weights|
    ensures Sum(weights) > 0 ==> Sum(shares) == amount
    ensures forall i :: 0 <= i < |shares| ==> shares[i] <= weights[i]
  {
    var total := Sum(weights);
    if total == 0 {
      assert amount == 0;
      shares := [];
      var j := 0;
      while j < |weights|
        invariant 0 <= j <= |weights|
        invariant |shares| == j
        invariant forall k :: 0 <= k < j ==> shares[k] == 0
      {
        shares := shares + [0];
        j := j + 1;
      }
      return;
    }

    shares := [];
    var cumulative: nat := 0;
    var reached: nat := 0;
    var i := 0;
    while i < |weights|
      invariant 0 <= i <= |weights|
      invariant |shares| == i
      invariant cumulative == Sum(weights[..i])
      invariant reached == amount * cumulative / total
      invariant Sum(shares) == reached
      invariant forall k :: 0 <= k < i ==> shares[k] <= weights[k]
    {
      assert weights[..i + 1] == weights[..i] + [weights[i]];
      SumAppend(weights[..i], weights[i]);
      ShareBounds(amount, cumulative, weights[i], total);
      var next := amount * (cumulative + weights[i]) / total;
      var share: nat := next - reached;
      SumAppend(shares, share);
      shares := shares + [share];
      cumulative := cumulative + weights[i];
      reached := next;
      i := i + 1;
    }
    assert weights[..i] == weights;
    assert amount * total / total == amount by {
      DivAddMultiple(0, amount, total);
      assert total * amount == amount * total;
    }
  }
}
