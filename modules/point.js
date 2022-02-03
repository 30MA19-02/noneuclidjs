import {sin, sinh, cos, cosh, multiply, matrix} from 'mathjs';

function sine(theta, kappa = 1, s = false) {
  return kappa == 0 ? (s ? 0 : theta) : kappa > 0 ? sin(theta * kappa) : (s ? -sinh(theta * kappa) : sinh(theta * kappa));
}
function cosine(theta, kappa = 1) {
  return kappa == 0 ? 1 : kappa > 0 ? cos(theta * kappa) : cosh(theta * kappa);
}

function rotation(theta, kappa){
  return matrix([
    [cosine(theta, kappa), -sine(theta, kappa, s=true)],
    [sine(theta, kappa), cos(theta, kappa)],
  ]);
}

function positional(...theta, kappa){
  let n = theta.length;
  if(n==0) return matrix([[1]]);
  return multiply(
    concat(concat(positional(...[theta.slice(0,-1)], kappa), zeros(n,1), 2), concat(zeros(1,n), identity(1), 2), 1)
    * matrix(new Array(n+1).fill(0).map(
      (_, i)=>new Array(n+1).fill(0).map((_,j)=>
        (i==j && i!=1 && i!= n) || (i==1&&j==n) || (i==n&&j==1)? 1:0
      )))
    * concat(concat(rotation(theta[n-1], kappa), zeros(2,n-1), 2), concat(zeros(n-1,2), identity(n-1), 2), 1)
    * matrix(new Array(n+1).fill(0).map(
      (_, i)=>new Array(n+1).fill(0).map((_,j)=>
        (i==j && i!=1 && i!= n) || (i==1&&j==n) || (i==n&&j==1)? 1:0
      )))
  );
}
function orientational(...phi, reflect=false){
  let n = phi.length;
  if(n==0) return matrix([[reflect? -1:1]]);
  return concat(concat(identity(1), zeros(1,n), 2), concat(zeros(n,1), point(...phi, +1), 2), 1);
}
function point(theta, ...phi, kappa){
  return multiply(orientational(...phi), positional(...theta, kappa))
}

export class Point {
  constructor(theta, ...phi, kappa) {
    this.kappa = kappa;
    this.mat = point(theta, ...phi, kappa);
  }
  get project() {
    return multiply(
      multiply(
        this.mat,
        matrix([[1], [0], [0]]),
      ),
      this.kappa != 0 ? 1 / this.kappa : 1
    );
  }
  operate(other) {
    console.assert(this.kappa == other.kappa, "Invalid point: This point (" + this.kappa.toString() + ") is not in the same with the other (" + other.kappa.toString() + ").")
    let p = new Point(0, 0, 0, this.kappa);
    p.mat = multiply(
      other.mat,
      this.mat,
    );
    return p;
  }
}
