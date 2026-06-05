// Verifies the JS Q-learning core (mirror of index.html) converges to the
// same optimal 8-step path as the verified Python qlearning.py.
const N_ROWS=5,N_COLS=5,N_STATES=25,N_ACTIONS=4;
const START=[0,0],GOAL=[4,4],GOAL_REWARD=10,STEP_PENALTY=-0.1;
const WALLS=new Set(["1,1","1,2","2,1","3,3","4,3"]);
const DELTA=[[-1,0],[1,0],[0,-1],[0,1]];
const isWall=(r,c)=>WALLS.has(r+","+c);
const inGrid=(r,c)=>r>=0&&r<N_ROWS&&c>=0&&c<N_COLS&&!isWall(r,c);
const rc2s=(r,c)=>r*N_COLS+c;
let cur=START.slice(),slip=0;
function reset(){cur=START.slice();return rc2s(cur[0],cur[1]);}
function step(a){
  if(slip>0&&Math.random()<slip)a=(Math.random()*N_ACTIONS)|0;
  const[dr,dc]=DELTA[a];let[r,c]=cur,nr=r+dr,nc=c+dc;
  if(inGrid(nr,nc))cur=[nr,nc];
  const done=(cur[0]===GOAL[0]&&cur[1]===GOAL[1]);
  return[rc2s(cur[0],cur[1]),done?GOAL_REWARD:STEP_PENALTY,done];
}
const rowMax=a=>Math.max(...a);
function argmaxR(a){const m=rowMax(a),t=[];a.forEach((v,i)=>{if(v===m)t.push(i);});return t[(Math.random()*t.length)|0];}

// train
let Q=Array.from({length:N_STATES},()=>[0,0,0,0]);
const A=0.3,G=0.95,N=600;let eps=1.0;
for(let ep=0;ep<N;ep++){
  let s=reset();
  for(let k=0;k<200;k++){
    const a=(Math.random()<eps)?(Math.random()*N_ACTIONS)|0:argmaxR(Q[s]);
    const[sn,r,done]=step(a);
    Q[s][a]+=A*(r+G*rowMax(Q[sn])*(done?0:1)-Q[s][a]);
    s=sn;if(done)break;
  }
  eps=Math.max(0.05,eps*0.995);
}
// greedy rollout
let s=reset(),steps=0,total=0,done=false;
for(let k=0;k<200;k++){const a=argmaxR(Q[s]);const[sn,r,d]=step(a);total+=r;steps++;s=sn;if(d){done=true;break;}}
console.log(`greedy: reached=${done} steps=${steps} reward=${total.toFixed(2)}`);
const ok = done && steps===8 && Math.abs(total-9.3)<1e-6;
console.log(ok ? "PASS: matches Python optimal (8 steps, +9.30)"
              : "FAIL: did not match expected optimum");
process.exit(ok?0:1);
