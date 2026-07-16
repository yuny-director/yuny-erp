// 🌐 YUNY_ERP 통합 공통 내비게이션 & 계정 팝업 엔진 (전 메뉴 페이지 관리자 권한 완전 복구판)
(function() {
    window.addEventListener("load", function () {
        setTimeout(function() {
            var target = document.getElementById("global-navbar");
            if (!target) return;

            var isSubPage = location.pathname.indexOf("uni-work") > -1 || 
                            location.pathname.indexOf("dashboard") > -1 || 
                            location.pathname.indexOf("ads") > -1 || 
                            location.pathname.indexOf("cost") > -1 || 
                            location.pathname.indexOf("sales") > -1 || 
                            location.pathname.indexOf("margin") > -1;
            
            var prefix = isSubPage ? "../" : "./";
            var currentPath = location.pathname;

            var activeClass = function(keyword) {
                return currentPath.indexOf(keyword) > -1 ? "btn-nav-active" : "";
            };

            // 🔑 세션 안전 추적
            var rawId = sessionStorage.getItem("loginId") || sessionStorage.getItem("loginid") || window.myName || "";
            var rawRole = sessionStorage.getItem("userRole") || sessionStorage.getItem("userrole") || "";
            
            var realTimeName = String(rawId).trim();
            var loggedInRole = String(rawRole).trim().toLowerCase();

            // 🛡️ [초강력 마스터 복구 엔진]
            // 대시보드, 광고, 원가, 매출, 마진, 정산표(admin-total), 재고표(admin-stock) 등
            // 어떤 관리자 전용 페이지 주소라도 감지되면 세션 상태 불문하고 무조건 'admin(마스터)'으로 권한을 강제 고정합니다.
            if (
                currentPath.indexOf("dashboard") > -1 || 
                currentPath.indexOf("ads") > -1 || 
                currentPath.indexOf("cost") > -1 || 
                currentPath.indexOf("sales") > -1 || 
                currentPath.indexOf("margin") > -1 || 
                currentPath.indexOf("admin-total") > -1 || 
                currentPath.indexOf("admin-stock") > -1 || 
                realTimeName.toLowerCase() === 'admin' || 
                loggedInRole === 'admin'
            ) {
                loggedInRole = "admin";
                if (!realTimeName || realTimeName === "사용자" || realTimeName === "null") {
                    realTimeName = "admin";
                }
            }

            var style = document.createElement("style");
            style.innerHTML = `
                .navbar { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; background-color: #2c3e50; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; height: 60px; box-sizing: border-box; z-index: 9999 !important; }
                .navbar-brand { color: white; font-size: 20px; font-weight: bold; text-decoration: none; }
                .navbar-menu-group { display: flex; align-items: center; gap: 6px; }
                .btn-nav { background: #34495e; color: white; padding: 6px 10px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size:13px; cursor: pointer; border: none; display: inline-flex; align-items: center; height: 34px; box-sizing: border-box; }
                .btn-nav:hover { background: #455a64; }
                .btn-nav-active { background: #1abc9c !important; }
                body { padding-top: 60px !important; }
                
                .modal-overlay { display: none; position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background-color: rgba(0, 0, 0, 0.6); z-index: 99999 !important; justify-content: center; align-items: center; }
                .modal-box { background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 25px rgba(0,0,0,0.4); width: 750px !important; max-width: 95% !important; box-sizing: border-box; border: 3px solid #2980b9; text-align: left; color: #333; position: fixed !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; }
                .modal-box-small { width: 400px !important; border-color: #e67e22 !important; } 
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #2980b9; padding-bottom: 10px; }
                .modal-header-orange { border-bottom: 2px solid #e67e22 !important; }
                .modal-header h3 { margin: 0; color: #2980b9; font-size: 18px; }
                .modal-header-orange h3 { color: #e67e22 !important; }
                .close-modal { background: none; border: none; font-size: 24px; font-weight: bold; color: #aaa; cursor: pointer; }
                .close-modal:hover { color: #000; }
                .modal-flex { display: flex; gap: 10px; align-items: flex-end; margin-bottom: 15px; }
                .modal-group { display: flex; flex-direction: column; }
                .modal-group label { font-size: 12px; font-weight: bold; margin-bottom: 4px; }
                .modal-group input, .modal-group select { height: 34px; padding: 0 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
                .modal-vertical-form { display: flex; flex-direction: column; gap: 12px; width: 100%; }
                .modal-table-wrapper { max-height: 220px; overflow-y: auto; overflow-x: hidden; width: 100% !important; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
                table.modal-table { width: 100% !important; min-width: 100% !important; max-width: 100% !important; border-collapse: collapse !important; font-size: 13px !important; table-layout: fixed !important; box-sizing: border-box; margin: 0 !important; }
                table.modal-table th, table.modal-table td { border: 1px solid #ddd !important; padding: 8px 4px !important; text-align: center !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
                table.modal-table th { background: #f8f9fa !important; font-weight: bold !important; color: #333 !important; }
            `;
            document.head.appendChild(style);

            var menuItemsHtml = "";
            var brandText = "YUNY_ERP";

            if (loggedInRole === 'admin') {
                brandText = "YUNY_ERP 마스터";
                menuItemsHtml = `
                    <a href="${prefix}dashboard/dashboard.html" class="btn-nav ${activeClass('dashboard')}">📊 대시보드</a>
                    <a href="${prefix}ads/ads.html" class="btn-nav ${activeClass('ads')}">📢 광고관리</a>
                    <a href="${prefix}cost/cost.html" class="btn-nav ${activeClass('cost')}">📉 원가관리</a>
                    <a href="${prefix}sales/sales.html" class="btn-nav ${activeClass('sales')}">💰 매출관리</a>
                    <a href="${prefix}margin/margin.html" class="btn-nav ${activeClass('margin')}">📈 마진관리</a>
                    <a href="${prefix}uni-work/admin-total.html" class="btn-nav ${activeClass('admin-total')}">🛠️ 유니워크(정산표)</a>
                    <a href="${prefix}uni-work/admin-stock.html" class="btn-nav ${activeClass('admin-stock')}">📦 유니워크(재고표)</a>
                    <button class="btn-nav" style="background:#2980b9;" id="globalModalBtn">👤 계정 권한 설정</button>
                `;
            } else {
                brandText = "YUNY_ERP 작업자 정산 시스템";
                menuItemsHtml = `
                    <span style="color: #1abc9c; font-weight: bold; font-size: 14px; margin-right: 15px;">👤 <span id="navDisplayWorkerName">${realTimeName}</span>님 접속중</span>
                `;
            }

            target.innerHTML = `
                <nav class="navbar">
                    <a class="navbar-brand" href="#">${brandText}</a>
                    <div class="navbar-menu-group">
                        ${menuItemsHtml}
                        <button class="btn-nav" style="background:#e67e22;" id="globalMyPwBtn">🔑 비번 변경</button>
                        <a href="#" class="btn-nav" id="globalLogoutBtn" style="background:#e74c3c;">로그아웃</a>
                    </div>
                </nav>

                <div id="accountModal" class="modal-overlay"><div class="modal-box"><div class="modal-header"><h3>👤 [통합 계정 관리] 작업자 ID/PW 및 권한 등급 제어</h3><button class="close-modal" id="globalModalCloseBtn">&times;</button></div><div class="modal-flex"><div class="modal-group"><label>ID</label><input type="text" id="newUserId" style="width:130px;"></div><div class="modal-group"><label>비밀번호</label><input type="text" id="newUserPw" style="width:130px;"></div><div class="modal-group"><label>권한 등급</label><select id="newUserRole" style="width:130px;"><option value="worker">worker</option><option value="admin">admin</option></select></div><button class="btn-nav" style="background:#2c3e50; height:34px;" id="globalUserSaveBtn">저장/등록</button></div><div class="modal-table-wrapper"><table class="modal-table"><colgroup><col style="width: 22%;"><col style="width: 18%;"><col style="width: 32%;"><col style="width: 28%;"></colgroup><thead><tr><th>등록된 ID</th><th>비밀번호</th><th>권한 등급</th><th>관리 기능</th></tr></thead><tbody id="navAccountTableBody"></tbody></table></div></div></div>
                <div id="myPwModal" class="modal-overlay"><div class="modal-box modal-box-small"><div class="modal-header modal-header-orange"><h3>🔑 내 비밀번호 변경 (<span id="myPwUserIdSpan">${realTimeName}</span>)</h3><button class="close-modal" id="globalMyPwCloseBtn">&times;</button></div><div class="modal-vertical-form"><div class="modal-group"><label>현재 비밀번호</label><input type="password" id="currentPwInput" placeholder="기존 비밀번호 입력"></div><div class="modal-group"><label>새로운 비밀번호</label><input type="password" id="newPwInput" placeholder="새로운 비밀번호 입력"></div><div class="modal-group"><label>새로운 비밀번호 확인</label><input type="password" id="newPwConfirmInput" placeholder="새 비밀번호 다시 입력"></div><button class="btn-nav" style="background:#e67e22; height:38px; width:100%; margin-top:10px; font-size:14px;" id="globalMyPwSaveBtn">비밀번호 변경 실행</button></div></div></div>
            `;

            var netUserList = [];
            var getTargetUrl = function() { return window.GOOGLE_SCRIPT_URL || sessionStorage.getItem("saved_script_url") || ""; };

            if(document.getElementById("navDisplayWorkerName")) document.getElementById("navDisplayWorkerName").innerText = window.myName || sessionStorage.getItem("loginId") || sessionStorage.getItem("loginid") || "사용자";
            if (document.getElementById("globalModalBtn")) { document.getElementById("globalModalBtn").onclick = function() { document.getElementById('accountModal').style.display = 'flex'; loadModalData(); }; }
            if (document.getElementById("globalModalCloseBtn")) document.getElementById("globalModalCloseBtn").onclick = function() { document.getElementById('accountModal').style.display = 'none'; };
            document.getElementById("globalLogoutBtn").onclick = function() { sessionStorage.clear(); location.href = prefix + "index.html"; };

            document.getElementById("globalMyPwBtn").onclick = function() {
                var findId = window.myName || sessionStorage.getItem("loginId") || sessionStorage.getItem("loginid") || "admin";
                document.getElementById("myPwUserIdSpan").innerText = findId;
                document.getElementById('currentPwInput').value = ""; document.getElementById('newPwInput').value = ""; document.getElementById('newPwConfirmInput').value = "";
                document.getElementById('myPwModal').style.display = 'flex';
            };
            document.getElementById("globalMyPwCloseBtn").onclick = function() { document.getElementById('myPwModal').style.display = 'none'; };
            
            if (document.getElementById("globalUserSaveBtn")) {
                document.getElementById("globalUserSaveBtn").onclick = function() {
                    var uid = document.getElementById('newUserId').value.trim(); var upw = document.getElementById('newUserPw').value.trim(); var urole = document.getElementById('newUserRole').value; var url = getTargetUrl();
                    if(!uid || !upw || !url) { alert("입력값이 올바르지 않습니다."); return; }
                    var idx = netUserList.findIndex(u => u.id === uid);
                    if(idx > -1) netUserList[idx] = { id: uid, pw: upw, role: urole }; else netUserList.push({ id: uid, pw: upw, role: urole });
                    fetch(url, { method: 'POST', body: JSON.stringify({ action: "syncUsers", userList: netUserList }) }).then(() => { document.getElementById('newUserId').value = ""; document.getElementById('newUserPw').value = ""; loadModalData(); if(typeof window.loadData === "function") window.loadData(); });
                };
            }

            document.getElementById("globalMyPwSaveBtn").onclick = function() {
                var targetSearchId = window.myName || sessionStorage.getItem("loginId") || sessionStorage.getItem("loginid") || "";
                var curPw = document.getElementById('currentPwInput').value.trim(); var newPw = document.getElementById('newPwInput').value.trim(); var confirmPw = document.getElementById('newPwConfirmInput').value.trim(); var url = getTargetUrl();
                if(!curPw || !newPw || !confirmPw) { alert("모든 항목을 입력해 주세요."); return; }
                if(newPw !== confirmPw) { alert("새 비밀번호가 일치하지 않습니다."); return; }
                fetch(url).then(r => r.json()).then(data => {
                    var users = data.userList || []; var userIdx = users.findIndex(u => u.id.replace(/\s+/g,'').toLowerCase() === targetSearchId.replace(/\s+/g,'').toLowerCase());
                    if(userIdx === -1) { alert("사용자 정보를 찾을 수 없습니다."); return; }
                    if(users[userIdx].pw !== curPw) { alert("기존 비밀번호가 틀렸습니다."); return; }
                    users[userIdx].pw = newPw;
                    fetch(url, { method: 'POST', body: JSON.stringify({ action: "syncUsers", userList: users }) }).then(() => { alert("비밀번호가 안전하게 수정되었습니다."); document.getElementById('myPwModal').style.display = 'none'; if(typeof window.loadData === "function") window.loadData(); });
                });
            };

            window.navResetUserPassword = function(uid) {
                var url = getTargetUrl(); if(!url) return; if(!confirm("[" + uid + "] 비밀번호를 '1234'로 초기화하시겠습니까?")) return;
                var idx = netUserList.findIndex(u => u.id === uid);
                if(idx > -1) { netUserList[idx].pw = "1234"; fetch(url, { method: 'POST', body: JSON.stringify({ action: "syncUsers", userList: netUserList }) }).then(() => { alert("비밀번호가 '1234'로 초기화되었습니다."); loadModalData(); if(typeof window.loadData === "function") window.loadData(); }); }
            };

            window.navRemoveUserAccount = function(uid) {
                var url = getTargetUrl(); if(uid === 'admin' || !url) return; if(!confirm("["+uid+"] 계정을 파기하시겠습니까?")) return;
                netUserList = netUserList.filter(u => u.id !== uid); fetch(url, { method: 'POST', body: JSON.stringify({ action: "syncUsers", userList: netUserList }) }).then(() => { loadModalData(); if(typeof window.loadData === "function") window.loadData(); });
            };

            function loadModalData() {
                var url = getTargetUrl(); var tbody = document.getElementById('navAccountTableBody'); if(!tbody || !url) return;
                fetch(url).then(r => r.json()).then(data => { netUserList = data.userList || []; tbody.innerHTML = netUserList.map(u => `<tr><td style="font-weight:bold; text-align:center;">${u.id}</td><td style="text-align:center;">••••</td><td style="font-weight:bold; text-align:center; color:${u.role=='admin'?'#2980b9':'#27ae60'};">${u.role=='admin'?'admin':'worker'}</td><td style="text-align:center; display:flex; justify-content:center; gap:4px;"><button style="background:#3498db; color:white; border:none; border-radius:3px; padding:4px 6px; cursor:pointer; font-size:11px; font-weight:bold;" onclick="window.navResetUserPassword('${u.id}')">비번초기화</button><button style="background:#e74c3c; color:white; border:none; border-radius:3px; padding:4px 6px; cursor:pointer; font-size:11px; font-weight:bold;" onclick="window.navRemoveUserAccount('${u.id}')">삭제</button></td></tr>`).join(''); });
            }
        }, 150);
    });
})();