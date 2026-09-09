(() => {
  const safe = (value) => String(value || '').replace(/[<>]/g, '').trim();
  const serviceLabels = { sweeping:'Mechanical Sweeping', grounds:'Grounds Maintenance', lawn:'Lawn & Garden', pressure:'Pressure Washing', fleet:'Fleet Washing' };
  const selectedServices = (form) => [...form.querySelectorAll('input[name="services"]:checked')].map((input) => input.value);

  async function postLead(payload) {
    try {
      const response = await fetch('/api/lead', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      if (!response.ok) throw new Error('Lead service unavailable');
      return await response.json();
    } catch (_) { return { ok:false, offline:true }; }
  }

  function persistLocalLead(lead) {
    try {
      const copy = { ...lead, photos:(lead.photos || []).map(({name,type}) => ({name,type})) };
      const existing = JSON.parse(localStorage.getItem('storeman-quote-leads') || '[]');
      const next = [copy, ...existing.filter((item) => item.id !== copy.id)].slice(0,10);
      localStorage.setItem('storeman-quote-leads', JSON.stringify(next));
    } catch (_) {}
  }

  function fileToDataUrl(file) {
    return new Promise((resolve,reject) => { const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); });
  }

  async function compressPhoto(file) {
    if (!file.type.startsWith('image/')) throw new Error('Only images are supported');
    const source = await fileToDataUrl(file);
    const img = new Image();
    await new Promise((resolve,reject) => { img.onload=resolve; img.onerror=reject; img.src=source; });
    const maxSide=1400, scale=Math.min(1,maxSide/Math.max(img.width,img.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(img.width*scale)); canvas.height=Math.max(1,Math.round(img.height*scale));
    canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    let quality=.78, dataUrl=canvas.toDataURL('image/jpeg',quality);
    while(dataUrl.length>1100000 && quality>.48){quality-=.1;dataUrl=canvas.toDataURL('image/jpeg',quality);}
    return { name:file.name.replace(/\.[^.]+$/,'')+'.jpg', type:'image/jpeg', content:dataUrl.split(',')[1] };
  }

  async function preparePhotos(input,status) {
    if (!input?.files?.length) return [];
    const files=[...input.files].slice(0,3);
    if(status) status.textContent='Preparing photos…';
    return Promise.all(files.map(compressPhoto));
  }

  function fillConfirmation(flow,payload) {
    const pairs = {
      '[data-confirm-services]': payload.services.map((s)=>serviceLabels[s]||s).join(', '),
      '[data-confirm-name]': payload.name,
      '[data-confirm-business]': payload.business,
      '[data-confirm-email]': payload.email,
      '[data-confirm-phone]': payload.phone,
      '[data-confirm-address]': payload.address,
      '[data-confirm-frequency]': payload.frequency,
      '[data-customer-email]': payload.email
    };
    Object.entries(pairs).forEach(([selector,value])=>{const el=flow.querySelector(selector);if(el)el.textContent=value;});
    const notesRow=flow.querySelector('[data-confirm-notes-row]'); if(notesRow) notesRow.hidden=!payload.notes;
    const notes=flow.querySelector('[data-confirm-notes]'); if(notes) notes.textContent=payload.notes||'';
    const photosRow=flow.querySelector('[data-confirm-photos-row]'); if(photosRow) photosRow.hidden=!(payload.photos?.length);
    const photos=flow.querySelector('[data-confirm-photos]'); if(photos) photos.textContent=payload.photos?.length?`${payload.photos.length} photo${payload.photos.length===1?'':'s'} attached`:'';
  }

  document.querySelectorAll('[data-quote-flow]').forEach((flow) => {
    const form=flow.querySelector('[data-quote-form]'); if(!form)return;
    const stages=[...flow.querySelectorAll('[data-quote-stage]')], indicators=[...flow.querySelectorAll('[data-quote-step]')], status=flow.querySelector('[data-quote-status]');
    const photoInput=flow.querySelector('input[name="photos"]'), photoSummary=flow.querySelector('[data-photo-summary]');
    let leadId='';

    if(photoInput&&photoSummary){photoInput.addEventListener('change',()=>{const count=Math.min(photoInput.files.length,3);photoSummary.textContent=count?`${count} photo${count===1?'':'s'} selected`:'Up to 3 photos. We’ll optimise them before sending.';});}

    function setStep(step){stages.forEach((stage)=>stage.classList.toggle('active',Number(stage.dataset.quoteStage)===step));indicators.forEach((indicator)=>indicator.classList.toggle('active',Number(indicator.dataset.quoteStep)<=step));flow.querySelector('.estimate-panel, .quote-form-panel')?.scrollTo?.({top:0,behavior:'smooth'});}
    function validateStage(step){const stage=flow.querySelector(`[data-quote-stage="${step}"]`);if(!stage)return true;for(const field of stage.querySelectorAll('[required]')){if(!field.checkValidity()){field.reportValidity();field.focus();return false;}}return true;}

    async function saveDetailsAndContinue(button){
      if(!validateStage(1))return;
      const data=new FormData(form); leadId=leadId||`stm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
      const lead={id:leadId,stage:'details_saved',createdAt:new Date().toISOString(),name:safe(data.get('name')),business:safe(data.get('business')),email:safe(data.get('email')),phone:safe(data.get('phone')),address:safe(data.get('address'))};
      if(button){button.disabled=true;button.textContent='SAVING…';} if(status)status.textContent=''; persistLocalLead(lead); await postLead(lead);
      if(button){button.disabled=false;button.innerHTML='SAVE &amp; CONTINUE <span>→</span>';} setStep(2);
    }

    form.addEventListener('click',async(event)=>{
      const saveButton=event.target.closest('[data-save-quote-lead]'); if(saveButton){event.preventDefault();await saveDetailsAndContinue(saveButton);return;}
      const submitButton=event.target.closest('[data-request-quote]');
      if(submitButton){
        event.preventDefault(); const services=selectedServices(form); if(!services.length){if(status)status.textContent='Select at least one service to continue.';return;}
        const data=new FormData(form); submitButton.disabled=true;submitButton.textContent='SENDING…';if(status)status.textContent='';
        let photos=[]; try{photos=await preparePhotos(photoInput,status);}catch(_){if(status)status.textContent='One of those photos could not be prepared. Please try a different image.';submitButton.disabled=false;submitButton.innerHTML='REQUEST MY FREE QUOTE <span>→</span>';return;}
        const payload={id:leadId||`stm_${Date.now().toString(36)}`,stage:'quote_requested',updatedAt:new Date().toISOString(),name:safe(data.get('name')),business:safe(data.get('business')),email:safe(data.get('email')),phone:safe(data.get('phone')),address:safe(data.get('address')),services,frequency:safe(data.get('frequency'))||'Not sure',notes:safe(data.get('notes')),photos,siteVisitFollowUp:true};
        persistLocalLead(payload); const result=await postLead(payload); fillConfirmation(flow,payload); setStep(3);
        if(status)status.textContent=result.ok===false&&result.offline?'Your request has been saved. Storeman will contact you to arrange your free site assessment.':'Request received — Storeman will contact you to arrange your free site assessment.';
        submitButton.disabled=false;submitButton.innerHTML='REQUEST MY FREE QUOTE <span>→</span>';return;
      }
      const backButton=event.target.closest('[data-quote-back]'); if(backButton){event.preventDefault();setStep(Number(backButton.dataset.quoteBack));}
    });
    form.addEventListener('submit',(event)=>event.preventDefault());

    const params=new URLSearchParams(window.location.search);
    if(params.get('prefill')==='1'){
      let prefill=null;try{prefill=JSON.parse(sessionStorage.getItem('storeman-quote-prefill')||'null');sessionStorage.removeItem('storeman-quote-prefill');}catch(_){}
      if(prefill){Object.entries(prefill).forEach(([name,value])=>{const field=form.elements.namedItem(name);if(field)field.value=value;});window.setTimeout(()=>saveDetailsAndContinue(form.querySelector('[data-save-quote-lead]')),80);}
    }
  });
})();
