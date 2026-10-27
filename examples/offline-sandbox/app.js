// Standalone deterministic illustration, independent of the production CRM runtime.
const copy = {
  zh: {lab:'演示实验室',boundary:'虚构数据 · 本地确定性演示 · 未调用模型 · 不外发消息 · 不读取真实数据',title:'把商机推进，留在证据之后。',intro:'体验证据差异核验、提议、人工决定与撤销。所有动作仅影响当前页面内存；刷新即重置。',opportunity:'演示商机',fiction:'虚构买家 · 户外储能电源',stage:'本地商机阶段',amount:'金额为虚构询盘字段，不代表收入或实测效果。',review:'证据与人工决定',evidenceHint:'预设冲突：旧报价与交期不一致。先核验当前版本，再生成提议。',source:'虚构证据',old:'旧版',current:'当前版本',quote:'报价单',delivery:'交期确认',replay:'状态回放',reset:'重置演示',replayHint:'点击事件查看当时快照；回放不会更改当前状态。',footer:'仅说明交互流程；并非真实多专家推理、生产系统执行或实测性能。需要 Node.js；pnpm 命令还需要 pnpm。',idle:'等待核验',verified:'证据已核验',pending:'等待人工决定',applied:'本地已批准',rejected:'已拒绝',undone:'已撤销',qualification:'资格评估',proposal:'方案沟通',verify:'核验差异：采用报价 v2 / 交期 v3',propose:'生成演示提议',approve:'批准本地更新',reject:'拒绝提议',undo:'撤销本地更新',pendingText:'演示提议：采用 USD 48,000 / 21 天，将阶段从资格评估推进至方案沟通。批准前不改变商机。',appliedText:'人工已批准：仅页面内存中的阶段变为方案沟通。没有发送报价或消息。',unchanged:'当前商机保持资格评估；未执行外部操作。',initial:'演示已初始化',version:'版本',snapshot:'历史快照',live:'当前状态',notice:'操作已记录，可在下方回放。'},
  en: {lab:'Demo laboratory',boundary:'Fictional data · Deterministic local demo · No model calls · No messages sent · No real data read',title:'Move the opportunity after the evidence.',intro:'Explore evidence review, a proposal, a human decision and undo. Actions affect this page’s memory only; refreshing resets the demo.',opportunity:'Demo opportunity',fiction:'Fictional buyer · Portable power stations',stage:'Local opportunity stage',amount:'Amount is a fictional inquiry field, not revenue or a measured result.',review:'Evidence & human decision',evidenceHint:'Preset conflict: old quote and delivery dates differ. Verify current versions before proposing a change.',source:'Fictional evidence',old:'Previous',current:'Current version',quote:'Quotation',delivery:'Delivery confirmation',replay:'State replay',reset:'Reset demo',replayHint:'Select an event to inspect its snapshot. Replay never changes the current state.',footer:'Interaction illustration only; not real multi-expert reasoning, production execution or measured performance. Requires Node.js; the pnpm command also requires pnpm.',idle:'Awaiting review',verified:'Evidence verified',pending:'Awaiting human decision',applied:'Approved locally',rejected:'Rejected',undone:'Undone',qualification:'Qualification',proposal:'Proposal',verify:'Verify: use quote v2 / delivery v3',propose:'Create demo proposal',approve:'Approve local change',reject:'Reject proposal',undo:'Undo local change',pendingText:'Demo proposal: use USD 48,000 / 21 days and move Qualification → Proposal. The opportunity stays unchanged until approval.',appliedText:'Human approved: only the stage in page memory changed to Proposal. No quote or message was sent.',unchanged:'The opportunity remains in Qualification; no external action occurred.',initial:'Demo initialized',version:'Version',snapshot:'Historical snapshot',live:'Current state',notice:'Action recorded. Inspect its snapshot below.'}
};
let lang = 'zh';
let state, history, replayIndex;
const t = key => copy[lang][key];
const byId = id => document.getElementById(id);
function reset(){state={phase:'idle',stage:'qualification',version:1};history=[{event:'initial',...state}];replayIndex=0;render();}
function act(action){
  const phase=state.phase;
  if(action==='verify'&&['idle','rejected','undone'].includes(phase))state.phase='verified';
  else if(action==='propose'&&phase==='verified')state.phase='pending';
  else if(action==='approve'&&phase==='pending'){state.phase='applied';state.stage='proposal';state.version++;}
  else if(action==='reject'&&phase==='pending')state.phase='rejected';
  else if(action==='undo'&&phase==='applied'){state.phase='undone';state.stage='qualification';state.version++;}
  else return;
  history.push({event:action,...state});replayIndex=history.length-1;render();byId('notice').textContent=t('notice');
}
function render(){
  document.documentElement.lang=lang==='zh'?'zh-CN':'en';
  document.querySelectorAll('[data-copy]').forEach(el=>{el.textContent=t(el.dataset.copy);});
  byId('language').textContent=lang==='zh'?'English':'中文';
  byId('stage').textContent=t(state.stage);byId('phase').textContent=t(state.phase);byId('version').textContent=`${t('version')} ${state.version}`;
  byId('proposal').textContent=t(['pending','applied'].includes(state.phase)?state.phase==='pending'?'pendingText':'appliedText':'unchanged');
  byId('notice').textContent='';
  const actions=['idle','rejected','undone'].includes(state.phase)?['verify']:state.phase==='verified'?['propose']:state.phase==='pending'?['approve','reject']:['undo'];
  byId('actions').replaceChildren(...actions.map(action=>{const button=document.createElement('button');button.textContent=t(action);button.dataset.action=action;button.className=action==='reject'?'':'primary';button.onclick=()=>act(action);return button;}));
  byId('history').replaceChildren(...history.map((entry,index)=>{const li=document.createElement('li');const button=document.createElement('button');button.textContent=`${t(entry.event)} · ${t(entry.phase)}`;button.setAttribute('aria-pressed',String(index===replayIndex));button.onclick=()=>{replayIndex=index;render();};li.append(button);return li;}));
  const snapshot=history[replayIndex];byId('snapshot').textContent=`${t('snapshot')} #${replayIndex+1}: ${t(snapshot.phase)} · ${t(snapshot.stage)} · ${t('version')} ${snapshot.version} | ${t('live')}: ${t(state.phase)} · ${t('version')} ${state.version}`;
}
byId('language').onclick=()=>{lang=lang==='zh'?'en':'zh';render();};byId('reset').onclick=reset;reset();
