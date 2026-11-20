/* Deduplicación reversible para el escaparate privado: nunca borra los datos de origen. */
(function () {
  'use strict';
  const sameName = value => String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');
  const knownPrice = value => typeof value === 'number' && Number.isFinite(value) && value > 0;

  function dedupeExactNames(records) {
    if (!Array.isArray(records)) throw Error('El catálogo debe ser una lista');
    const groups = new Map();
    for (const record of records) {
      const key = sameName(record.name);
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(record);
    }
    const selected = new Set();
    const discarded = [];
    for (const group of groups.values()) {
      if (group.length < 2 || !group.every(item => knownPrice(item.price))) {
        for (const item of group) selected.add(item);
        continue;
      }
      const cheapest = group.reduce((best, item) => item.price < best.price ? item : best);
      selected.add(cheapest);
      for (const item of group) if (item !== cheapest) {
        discarded.push({ref:item.ref, name:item.name, price:item.price, keptRef:cheapest.ref,
          keptPrice:cheapest.price, reason:'Mismo nombre completo, precio anunciado mayor o igual'});
      }
    }
    return {products:records.filter(item => selected.has(item)), discarded};
  }

  function auditDuplicates(records) {
    if (!Array.isArray(records)) throw Error('El catálogo debe ser una lista');
    const groups=new Map(), asins=new Map();
    for (const item of records) {
      const title=sameName(item.name);
      if(title)groups.set(title,[...(groups.get(title)||[]),item]);
      const asin=String(item.asin||'').trim().toUpperCase();
      if(asin)asins.set(asin,[...(asins.get(asin)||[]),item]);
    }
    const exact=[...groups.values()].filter(group=>group.length>1);
    const unresolved=exact.filter(group=>!group.every(item=>knownPrice(item.price)));
    const sharedAsin=[...asins.values()].filter(group=>group.length>1&&
      new Set(group.map(item=>sameName(item.name))).size>1);
    const filtered=dedupeExactNames(records);
    return {
      examined:records.length,
      exactGroups:exact.length,
      removedByPrice:filtered.discarded.length,
      missingPrices:unresolved.length,
      sameAsinDifferentName:sharedAsin.length,
      products:filtered.products,
      discarded:filtered.discarded
    };
  }

  window.VelansPreviewRules = {dedupeExactNames,auditDuplicates};
})();
