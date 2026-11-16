function Sum(s: seq<nat>): nat {
  if |s| == 0 then 0 else Sum(s[..|s| - 1]) + s[|s| - 1]
}

// Total fee for a cart of pets.
method TotalFee(fees: seq<nat>) returns (total: nat)
  ensures total == Sum(fees)
{
  total := 0;
  var i := 0;
  while i < |fees|
    invariant 0 <= i <= |fees|
    invariant total == Sum(fees[..i])
  {
    assert fees[..i + 1][..i] == fees[..i];
    total := total + fees[i];
    i := i + 1;
  }
  assert fees[..i] == fees;
}
