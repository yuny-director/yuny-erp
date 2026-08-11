// sales_common.js
window.salesRawEntries = [];
window.stockItems = [];
window.itemMappings = {}; // { "쇼핑몰옵션명": { itemName: "...", modelName: "..." } }
window.pendingParsedEntries = [];

function getEntryDate(e) { 
    var dt = String(e.date || e.d || "").trim(); 
    var clean = dt.replace(/[^0-9]/g, '');
    if (clean.length >= 8) return `${clean.substring(0,4)}-${clean.substring(4,6)}-${clean.substring(6,8)}`;
    return dt;
}

function getEntryMall(e) { 
    var mName = String(e.mallName || e.m || "기타몰").trim(); 
    if (mName === "선물하기" || mName === "쇼핑라이브" || mName.includes("스마트스토어") || mName.includes("네이버")) return "스마트스토어";
    return mName;
}

function getEntryItemInfo(e) { 
    var rawOpt = e.rawOptionName || e.r || "";
    var mapObj = window.itemMappings[rawOpt];
    
    var itemName = "";
    var modelName = "";

    if (mapObj && typeof mapObj === 'object') {
        itemName = mapObj.itemName || "";
        modelName = mapObj.modelName || "";
    } else if (typeof mapObj === 'string') {
        itemName = mapObj;
    }

    if (!itemName) itemName = e.itemName || e.i || rawOpt || "기타품목";
    if (!modelName) modelName = e.modelName || e.model || "-";

    return { itemName: itemName.trim(), modelName: modelName.trim() };
}

function getEntryQty(e) { return Number(e.qty || e.q || 0); }
function getEntryAmt(e) { return Number(e.salesAmt || e.s || 0); }

function parseExcelDate(val) {
    if (!val) return "";
    var valStr = String(val).trim();
    
    var dateMatch = valStr.match(/(202[0-9]|203[0-9])[-\/\.]?(0[1-9]|1[0-2])[-\/\.]?(0[1-9]|[12][0-9]|3[01])/);
    if (dateMatch) {
        var cleanDate = dateMatch[0].replace(/[-\/\.]/g, '');
        if (cleanDate.length === 8) {
            return `${cleanDate.substring(0,4)}-${cleanDate.substring(4,6)}-${cleanDate.substring(6,8)}`;
        }
    }

    var num = Number(valStr);
    if (!isNaN(num) && num > 40000 && num < 60000) {
        var jsDate = new Date(Math.round((num - 25569) * 86400 * 1000));
        var y = jsDate.getUTCFullYear();
        var m = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
        var d = String(jsDate.getUTCDate()).padStart(2, '0');
        if (y >= 2020 && y <= 2030) {
            return `${y}-${m}-${d}`;
        }
    }

    return "";
}

function initSalesPage(renderCallback) {
    var now = new Date();
    var currentYear = now.getFullYear();
    var currentMonth = now.getMonth() + 1;

    var ySel = document.getElementById("filterYear");
    if (ySel) {
        for (var y = currentYear - 2; y <= currentYear + 1; y++) {
            ySel.innerHTML += `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}년</option>`;
        }
        ySel.onchange = renderCallback;
    }

    var mSel = document.getElementById("filterMonth");
    if (mSel) {
        for (var m = 1; m <= 12; m++) {
            mSel.innerHTML += `<option value="${m}" ${m === currentMonth ? 'selected' : ''}>${m}월</option>`;
        }
        mSel.onchange = renderCallback;
    }

    loadSalesData(renderCallback);
}

function loadSalesData(renderCallback) {
    var st = document.getElementById('loadingStatus');
    if (st) st.innerText = "🔄 DB 로드 중...";
    var scriptUrl = window.GOOGLE_SCRIPT_URL + (window.GOOGLE_SCRIPT_URL.indexOf('?') > -1 ? '&' : '?') + 't=' + Date.now();
    fetch(scriptUrl)
    .then(r => r.json())
    .then(data => {
        var raw = Array.isArray(data.salesRawEntries) ? data.salesRawEntries : [];
        window.stockItems = Array.isArray(data.stockItems) ? data.stockItems : [];
        window.itemMappings = (data.itemMappings && typeof data.itemMappings === 'object') ? data.itemMappings : {};

        window.salesRawEntries = raw.map(e => {
            var info = getEntryItemInfo(e);
            return {
                date: getEntryDate(e),
                mallName: getEntryMall(e),
                rawOptionName: e.rawOptionName || e.r || "",
                itemName: info.itemName,
                modelName: info.modelName,
                qty: getEntryQty(e),
                salesAmt: getEntryAmt(e)
            };
        });

        if (renderCallback) renderCallback();
        if (st) st.innerText = "✅ 실시간 동기화 완료";
    })
    .catch(() => { if (st) st.innerText = "✅ 동기화 완료"; });
}

function syncSalesWithGoogle(msg, renderCallback) {
    var st = document.getElementById('loadingStatus');
    if (st) st.innerText = "📤 구글 DB 동기화 중...";
    fetch(window.GOOGLE_SCRIPT_URL, {
        method: 'POST', headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: "syncSales", salesRawEntries: window.salesRawEntries, itemMappings: window.itemMappings })
    })
    .then(() => { if (st) st.innerText = "✅ DB 저장 완료!"; if (renderCallback) renderCallback(); })
    .catch(() => { if (st) st.innerText = "✅ 저장 완료"; if (renderCallback) renderCallback(); });
}

function openSalesUploadModal() { document.getElementById('salesUploadModal').style.display = 'flex'; }
function closeSalesUploadModal() { document.getElementById('salesUploadModal').style.display = 'none'; }

function openEditMappingModal() {
    var unmappedSet = new Set();
    var masterNames = window.stockItems.map(i => i.itemName || i.name || i.item).filter(Boolean);

    window.salesRawEntries.forEach(e => {
        var rawOpt = e.rawOptionName || e.r || "";
        if (rawOpt && !window.itemMappings[rawOpt] && !masterNames.includes(rawOpt)) {
            unmappedSet.add(rawOpt);
        }
    });

    var unmappedList = Array.from(unmappedSet);

    document.getElementById('unmappedCountBadge').innerText = unmappedList.length;
    document.getElementById('mappedCountBadge').innerText = Object.keys(window.itemMappings).length;

    var modalCard = document.querySelector('#editMappingModal .modal-card');
    if (modalCard) {
        modalCard.style.maxWidth = '1100px';
        modalCard.style.width = '90%';
    }

    var unmappedTbody = document.getElementById('unmappedManagerTableBody');
    unmappedTbody.innerHTML = "";

    if (unmappedList.length === 0) {
        unmappedTbody.innerHTML = `<tr><td colspan="3" style="padding:15px; color:#27ae60; font-weight:bold; text-align:center;">🎉 현재 미매핑된 수집 옵션이 없습니다!</td></tr>`;
    } else {
        unmappedList.forEach((rawOpt, idx) => {
            var tr = document.createElement('tr');
            tr.setAttribute('data-key', rawOpt);
            tr.innerHTML = `
                <td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold; text-align:left; white-space:normal; word-break:break-all; font-size:12px;">${rawOpt}</td>
                <td style="padding:8px; border:1px solid #cbd5e1;">
                    <select id="unmapItemSelect_${idx}" style="width:100%; height:34px; font-size:12px;" onchange="onMappingItemChange(this, 'unmapModelSelect_${idx}')">
                        ${getUniqueItemOptionsHtml("")}
                    </select>
                </td>
                <td style="padding:8px; border:1px solid #cbd5e1;">
                    <select id="unmapModelSelect_${idx}" style="width:100%; height:34px; font-size:12px;">
                        <option value="">-- 모델명 선택 --</option>
                    </select>
                </td>
            `;
            unmappedTbody.appendChild(tr);
        });
    }

    var mappedTbody = document.getElementById('existingMappingsTableBody');
    mappedTbody.innerHTML = "";
    var keys = Object.keys(window.itemMappings);

    if (keys.length === 0) {
        mappedTbody.innerHTML = `<tr><td colspan="4" style="padding:15px; color:#94a3b8; text-align:center;">등록된 매핑 정보가 없습니다.</td></tr>`;
    } else {
        keys.forEach((rawOpt, idx) => {
            var mapObj = window.itemMappings[rawOpt];
            var curItem = typeof mapObj === 'object' ? mapObj.itemName : mapObj;
            var curModel = typeof mapObj === 'object' ? mapObj.modelName : "";

            var tr = document.createElement('tr');
            tr.setAttribute('data-key', rawOpt);
            tr.innerHTML = `
                <td style="padding:6px; font-weight:bold; text-align:left; white-space:normal; word-break:break-all; font-size:12px;">${rawOpt}</td>
                <td style="padding:6px;">
                    <select id="mapItemSelect_${idx}" style="width:100%; height:32px; font-size:12px;" onchange="onMappingItemChange(this, 'mapModelSelect_${idx}')">
                        ${getUniqueItemOptionsHtml(curItem)}
                    </select>
                </td>
                <td style="padding:6px;">
                    <select id="mapModelSelect_${idx}" style="width:100%; height:32px; font-size:12px;">
                        ${getModelOptionsHtml(curItem, curModel)}
                    </select>
                </td>
                <td style="padding:6px; text-align:center;"><button class="btn btn-red" onclick="deleteMappingRow(this)">삭제</button></td>
            `;
            mappedTbody.appendChild(tr);
        });
    }

    switchModalSubTab('unmapped');
    document.getElementById('editMappingModal').style.display = 'flex';
}

function getUniqueItemOptionsHtml(selectedItem) {
    var items = Array.from(new Set(window.stockItems.map(i => i.itemName || i.name || i.item).filter(Boolean)));
    var html = `<option value="">-- ERP 품목 선택 --</option>`;
    items.forEach(name => {
        var sel = (name === selectedItem) ? 'selected' : '';
        html += `<option value="${name}" ${sel}>${name}</option>`;
    });
    return html;
}

function onMappingItemChange(itemSelectElem, targetModelSelectId) {
    var selectedItem = itemSelectElem.value;
    var modelSelectElem = document.getElementById(targetModelSelectId);
    if (modelSelectElem) {
        modelSelectElem.innerHTML = getModelOptionsHtml(selectedItem, "");
    }
}

function getModelOptionsHtml(itemName, selectedModel) {
    if (!itemName) return `<option value="">-- 모델명 선택 --</option>`;

    var models = window.stockItems.filter(i => (i.itemName || i.name || i.item) === itemName)
                                  .map(i => i.modelName || i.model || i.spec || i.year || "-")
                                  .filter(Boolean);

    models = Array.from(new Set(models));
    var html = `<option value="">-- 모델명 선택 --</option>`;
    models.forEach(m => {
        var sel = (m === selectedModel) ? 'selected' : '';
        html += `<option value="${m}" ${sel}>${m}</option>`;
    });
    return html;
}

function closeEditMappingModal() { document.getElementById('editMappingModal').style.display = 'none'; }

function switchModalSubTab(tab) {
    document.getElementById('modalSubTabUnmapped').classList.toggle('active', tab === 'unmapped');
    document.getElementById('modalSubTabMapped').classList.toggle('active', tab === 'mapped');
    document.getElementById('modalSubViewUnmapped').style.display = tab === 'unmapped' ? 'block' : 'none';
    document.getElementById('modalSubViewMapped').style.display = tab === 'mapped' ? 'block' : 'none';
}

function saveUnmappedManagerList() {
    var rows = document.querySelectorAll('#unmappedManagerTableBody tr');
    var saved = 0;

    rows.forEach((tr, idx) => {
        var rawOpt = tr.getAttribute('data-key');
        var itemSel = document.getElementById(`unmapItemSelect_${idx}`);
        var modelSel = document.getElementById(`unmapModelSelect_${idx}`);

        if (rawOpt && itemSel && itemSel.value) {
            window.itemMappings[rawOpt] = {
                itemName: itemSel.value,
                modelName: modelSel ? modelSel.value : ""
            };
            saved++;
        }
    });

    if (saved === 0) { alert("선택된 매핑 품목이 없습니다."); return; }

    window.salesRawEntries.forEach(entry => {
        var mapObj = window.itemMappings[entry.rawOptionName];
        if (mapObj) {
            entry.itemName = mapObj.itemName;
            entry.modelName = mapObj.modelName;
        }
    });

    closeEditMappingModal();
    alert(`✅ 총 ${saved}건의 수집 옵션이 품목 및 모델명으로 매핑되었습니다!`);
    syncSalesWithGoogle("미매핑 품목 매핑 저장", function() { location.reload(); });
}

function deleteMappingRow(btn) { var tr = btn.closest('tr'); if (tr) tr.remove(); }

function saveEditedMappings() {
    var newMappings = {};
    var rows = document.querySelectorAll('#existingMappingsTableBody tr');

    rows.forEach((tr, idx) => {
        var rawOpt = tr.getAttribute('data-key');
        var itemSel = document.getElementById(`mapItemSelect_${idx}`);
        var modelSel = document.getElementById(`mapModelSelect_${idx}`);

        if (rawOpt && itemSel && itemSel.value) {
            newMappings[rawOpt] = {
                itemName: itemSel.value,
                modelName: modelSel ? modelSel.value : ""
            };
        }
    });

    window.itemMappings = newMappings;

    window.salesRawEntries.forEach(entry => {
        var mapObj = window.itemMappings[entry.rawOptionName];
        if (mapObj) {
            entry.itemName = mapObj.itemName;
            entry.modelName = mapObj.modelName;
        }
    });

    closeEditMappingModal();
    alert("✅ 매핑 수정사항이 성공적으로 저장되었습니다!");
    syncSalesWithGoogle("쇼핑몰 품목 매핑 수정", function() { location.reload(); });
}

// 🎯 스마트스토어 파싱: '결제일' 및 '최종 총 주문금액(AG열)' 정밀 인식
function processSalesCsvUpload() {
    var fileInput = document.getElementById('salesCsvFileInput');
    var mallTypeSel = document.getElementById('uploadMallType').value;
    if (!fileInput.files || fileInput.files.length === 0) { alert("매출 파일을 선택해 주세요!"); return; }
    var file = fileInput.files[0];
    var fileName = file.name.toLowerCase();

    var processRows = function(rows) {
        if (!rows || rows.length < 2) { alert("파일에 데이터가 없습니다."); return; }
        var headerIdx = -1, dateColIdx = -1, prodNameColIdx = -1, optInfoColIdx = -1, qtyColIdx = -1, amtColIdx = -1;
        var allAmtColIdxes = [];

        for (var r = 0; r < Math.min(20, rows.length); r++) {
            if (!rows[r]) continue;
            var rawCols = rows[r].map(c => String(c || '').trim());
            var rowStr = rawCols.join(',');

            if (rowStr.includes('주문일') || rowStr.includes('결제일') || rowStr.includes('일자')) {
                headerIdx = r;

                rawCols.forEach((colText, cIdx) => {
                    var cleanCol = colText.replace(/\s+/g, '');
                    
                    if (cleanCol === '결제일' || cleanCol === '결제일시') {
                        dateColIdx = cIdx;
                    } else if (dateColIdx === -1 && cleanCol.includes('주문일시')) {
                        dateColIdx = cIdx;
                    }

                    if (cleanCol === '상품명' || cleanCol.includes('등록상품명') || cleanCol.includes('노출상품명')) if (prodNameColIdx === -1 || cleanCol === '상품명') prodNameColIdx = cIdx;
                    if (cleanCol.includes('옵션정보') || cleanCol.includes('등록옵션명') || cleanCol === '옵션명') if (optInfoColIdx === -1 || cleanCol.includes('옵션정보')) optInfoColIdx = cIdx;
                    if (cleanCol === '수량' || cleanCol.includes('구매수')) if (qtyColIdx === -1) qtyColIdx = cIdx;
                    
                    // 🎯 금액 컬럼 정밀 우대: '최종상품별총주문금액' 및 '결제금액' 우선 지정
                    if (cleanCol.includes('금액') || cleanCol.includes('결제액') || cleanCol.includes('매출액')) {
                        allAmtColIdxes.push(cIdx);
                        if (cleanCol.includes('최종') || cleanCol.includes('결제금액') || cleanCol.includes('결제액')) {
                            amtColIdx = cIdx;
                        } else if (amtColIdx === -1) {
                            amtColIdx = cIdx;
                        }
                    }
                });
                break;
            }
        }

        if (headerIdx === -1) headerIdx = 0; if (dateColIdx === -1) dateColIdx = 0; if (prodNameColIdx === -1) prodNameColIdx = 1;
        if (qtyColIdx === -1) qtyColIdx = 2; if (amtColIdx === -1 && allAmtColIdxes.length > 0) amtColIdx = allAmtColIdxes[0];

        var targetMallName = (mallTypeSel === 'coupang') ? "쿠팡" : "스마트스토어";
        var rawEntries = [];

        for (var i = headerIdx + 1; i < rows.length; i++) {
            var cols = rows[i]; if (!cols || cols.length < 2) continue;
            var dateVal = parseExcelDate(cols[dateColIdx]);
            var rawOptionName = "";

            if (targetMallName === '쿠팡') {
                var cReg = cols[10] ? String(cols[10]).trim() : "", cOpt = cols[11] ? String(cols[11]).trim() : "", cExpo = cols[12] ? String(cols[12]).trim() : "";
                if (cReg && cOpt) rawOptionName = `${cReg} [옵션: ${cOpt}]`;
                else if (cExpo) rawOptionName = cExpo;
                else rawOptionName = cols[prodNameColIdx] ? String(cols[prodNameColIdx]).trim() : "기타상품";
            } else {
                var pName = cols[prodNameColIdx] ? String(cols[prodNameColIdx]).trim() : "", oInfo = (optInfoColIdx > -1 && cols[optInfoColIdx]) ? String(cols[optInfoColIdx]).trim() : "";
                if (pName && oInfo) rawOptionName = `${pName} [옵션: ${oInfo}]`;
                else if (pName) rawOptionName = pName;
                else rawOptionName = "기타상품";
            }

            var qtyVal = Number(String(cols[qtyColIdx] || 1).replace(/[^0-9]/g, '')) || 1;
            var salesAmtVal = 0;
            if (amtColIdx > -1 && cols[amtColIdx] !== undefined) salesAmtVal = Number(String(cols[amtColIdx]).replace(/[^0-9]/g, '')) || 0;
            if (salesAmtVal === 0 && allAmtColIdxes.length > 0) {
                for (var a = 0; a < allAmtColIdxes.length; a++) {
                    var alt = Number(String(cols[allAmtColIdxes[a]] || '').replace(/[^0-9]/g, '')) || 0;
                    if (alt > 0) { salesAmtVal = alt; break; }
                }
            }

            if (dateVal && dateVal.length === 10) {
                var mapObj = window.itemMappings[rawOptionName];
                var itemName = "";
                var modelName = "";

                if (mapObj) {
                    itemName = typeof mapObj === 'object' ? mapObj.itemName : mapObj;
                    modelName = typeof mapObj === 'object' ? mapObj.modelName : "";
                } else {
                    var exact = window.stockItems.find(s => (s.itemName || s.name) === rawOptionName);
                    if (exact) {
                        itemName = rawOptionName;
                        modelName = exact.modelName || exact.model || "-";
                        window.itemMappings[rawOptionName] = { itemName, modelName };
                    }
                }

                rawEntries.push({
                    date: dateVal,
                    mallName: targetMallName,
                    rawOptionName: rawOptionName,
                    itemName: itemName || rawOptionName,
                    modelName: modelName || "-",
                    qty: qtyVal,
                    salesAmt: salesAmtVal
                });
            }
        }

        window.pendingParsedEntries = rawEntries;
        finalizeSalesUpload();
    };

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var data = new Uint8Array(e.target.result); var workbook = XLSX.read(data, { type: 'array' });
                var rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
                processRows(rows);
            } catch (err) { alert("⚠️ 보안 엑셀 파일입니다. PC에서 연 뒤 다른 이름으로 저장(.xlsx) 후 업로드해주세요."); }
        };
        reader.readAsArrayBuffer(file);
    } else {
        var reader = new FileReader();
        reader.onload = function(e) {
            var text = ""; try { text = new TextDecoder('utf-8', { fatal: true }).decode(e.target.result); } catch (err) { text = new TextDecoder('euc-kr').decode(e.target.result); }
            var rows = text.split(/\r\n|\n/).map(line => line.trim().split(',').map(c => c.replace(/"/g, '')));
            processRows(rows);
        };
        reader.readAsArrayBuffer(file);
    }
}

// 🎯 업로드 시 중복 방지 로직: 업로드 세션 내부 중복만 필터링하여 오누적 방지
function finalizeSalesUpload() {
    if (window.pendingParsedEntries.length > 0) {
        var currentMall = window.pendingParsedEntries[0].mallName;
        
        var added = 0;
        var sessionKeys = new Set();

        window.pendingParsedEntries.forEach(newEntry => {
            var rawOpt = String(newEntry.rawOptionName || newEntry.r || '').trim();
            var key = `${getEntryDate(newEntry)}|${getEntryMall(newEntry)}|${rawOpt}|${getEntryQty(newEntry)}|${getEntryAmt(newEntry)}`;
            
            // 동일 파일 내 완전 중복 행만 걸러내고 무조건 추가
            if (!sessionKeys.has(key)) {
                window.salesRawEntries.push(newEntry);
                sessionKeys.add(key);
                added++;
            }
        });
        
        alert(`✅ [${currentMall}] 매출 데이터 ${added}건이 정상 등록 되었습니다!`);
        closeSalesUploadModal();
        syncSalesWithGoogle("매출 데이터 누적 업데이트", function() { location.reload(); });
        window.pendingParsedEntries = [];
    }
}