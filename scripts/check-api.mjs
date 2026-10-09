import assert from 'node:assert/strict';
const base=process.env.AETHERQ_TEST_ORIGIN || 'http://localhost:3000';
for(const [path,method,status] of [['/api/sql','POST',401],['/api/chat','POST',401],['/api/documents/qa','POST',401],['/api/search','POST',401],['/api/documents/upload','POST',401],['/api/documents','DELETE',401],['/api/documents','GET',401],['/api/analytics/summary','GET',401],['/api/workspace/stats','GET',401],['/api/auth/guest','POST',410]]) {
 const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json'},...(method==='POST'||method==='DELETE'?{body:'{}'}:{})});
 assert.equal(r.status,status,path); console.log(`${method} ${path}: ${status}`);
}
const r=await fetch(base+'/workspace',{redirect:'manual',headers:{cookie:'aetherq_guest_mode=true; aetherq_guest_id=forged'}});
assert.equal(r.status,307);assert.match(r.headers.get('location'),/\/login/);console.log('Forged guest cookies do not grant workspace access');
