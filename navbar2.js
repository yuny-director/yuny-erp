// 🚨 YUNY_ERP 전역 네비게이션바 (어느 페이지에서나 계정목록 무조건 로드 보장 완본)
(function() {
    // 🎯 [핵심] GOOGLE_SCRIPT_URL 전역 안전장치 (config.js 누락 대비)
    if (!window.GOOGLE_SCRIPT_URL || window.GOOGLE_SCRIPT_URL === "") {
        window.GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyPWv070zApltQFMeq6HUxFAnnBcZfpAXHz5n_vwnmX34kCXqadFumI1BfmJRWu0OZE/exec";
    }

    function initNavbar() {
        var navbarContainer = document.getElementById('global-navbar');
        if (!navbarContainer) return;

        var currentPath = window.location.pathname;
        var userRole = localStorage.getItem('login_user_role') || "admin";
        
        var userPermissions = {};
        try {
            userPermissions = JSON.parse(localStorage.getItem('login_user_permissions') || "{}");
        } catch(e) { userPermissions = {}; }

        if (userRole === "admin") {
            userPermissions = {
                dashboard: 'edit', ads: 'edit', cost: 'edit', sales: 'edit', margin: 'edit', stock: 'edit',
                uniwork: 'admin', accountMgr: 'full'
            };
        }

        var canDash = userPermissions.dashboard !== 'hide';
        var canAds = userPermissions.ads !== 'hide';
        var canCost = userPermissions.cost !== 'hide';
        var canSales = userPermissions.sales !== 'hide';
        var canMargin = userPermissions.margin !== 'hide';
        var canStock = userPermissions.stock !== 'hide';
        var canUniwork = userPermissions.uniwork !== 'hide';
        var canManageAccounts = (userPermissions.accountMgr === 'full') || (userRole === 'admin');

        var uniworkLink = "../uni-work/admin-total.html";
        var isWorkerMode = (userPermissions.uniwork === 'worker') || (userRole === 'worker');
        if (isWorkerMode && userRole !== 'admin') {
            uniworkLink = "../uni-work/worker-input.html";
        }

        var isDashboard = currentPath.indexOf('dashboard') > -1;
        var isAds = currentPath.indexOf('ads') > -1;
        var isCost = currentPath.indexOf('cost') > -1;
        var isSales = currentPath.indexOf('sales') > -1;
        var isMargin = currentPath.indexOf('margin') > -1;
        var isTotal = currentPath.indexOf('admin-total') > -1 || currentPath.indexOf('worker-input') > -1;
        var isStock = currentPath.indexOf('admin-stock') > -1 || currentPath.indexOf('admin-order') > -1;

        var navHtml = `
        <style>
            .custom-navbar { 
                position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important;
                width: 100vw !important; height: 50px !important; z-index: 999999 !important; 
                background-color: #2c3e50 !important; color: white !important; display: flex !important; 
                justify-content: space-between !important; align-items: center !important; padding: 0 15px !important; 
                font-family: Arial, sans-serif !important; font-size: 13px !important; box-sizing: border-box !important; 
                box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
            }
            .custom-navbar-left { display: flex; align-items: center; gap: 6px; }
            .custom-navbar a { color: #ecf0f1; text-decoration: none; padding: 6px 10px; border-radius: 4px; font-weight: bold; white-space: nowrap; transition: background 0.2s; display: inline-flex; align-items: center; gap: 4px; }
            .custom-navbar a:hover { background-color: #34495e; color: #1abc9c; }
            .navbar-brand { font-size: 16px; font-weight: bold; color: #1abc9c !important; margin-right: 8px; }
            .custom-navbar a.active-menu { background-color: #1abc9c !important; color: #ffffff !important; }
            
            .nav-dropdown { position: relative; display: inline-block; }
            .nav-dropdown-content { display: none; position: absolute; top: 100%; left: 0; background-color: #34495e; min-width: 140px; box-shadow: 0 8px 16px rgba(0,0,0,0.3); border-radius: 0 0 6px 6px; z-index: 1000; padding: 5px 0; }
            .nav-dropdown-content a { color: #ecf0f1; padding: 10px 14px; text-decoration: none; display: block; border-radius: 0; font-size: 12px; }
            .nav-dropdown-content a:hover { background-color: #1abc9c; color: white; }
            .nav-dropdown:hover .nav-dropdown-content { display: block; }

            .navbar-user-info { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
            .navbar-user-name-text { font-size: 13px; font-weight: bold; color: #ffffff; margin-right: 4px; }
            .btn-nav-action { background-color: #34495e; border: 1px solid #7f8c8d; color: white; padding: 5px 9px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; }
            .btn-nav-action:hover { background-color: #415b76; color: #1abc9c; }
            .btn-nav-orange { background-color: #e67e22; border: none; }
            .btn-nav-red { background-color: #e74c3c; border: none; }

            .account-modal-overlay { display: none; position: fixed; z-index: 1000000; left: 0; top: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.55); align-items: center; justify-content: center; }
            .account-modal-card { background-color: #ffffff; padding: 22px; border-radius: 10px; width: 95%; max-width: 850px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); box-sizing: border-box; }
            .account-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #2c3e50; }
            .account-modal-header h3 { margin: 0; font-size: 17px; color: #2c3e50; font-weight: bold; }
            .account-modal-close { cursor: pointer; font-size: 22px; font-weight: bold; color: #888; }
            .account-modal-close:hover { color: #e74c3c; }

            .perm-grid-box { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: #f1f3f5; padding: 10px; border-radius: 6px; margin-top: 10px; font-size: 11px; text-align: left; }
            .perm-grid-box label { font-weight: bold; color: #333; display: flex; align-items: center; gap: 4px; }
            .perm-grid-box select { height: 26px; font-size: 11px; padding: 0 4px; border-radius: 4px; border: 1px solid #ccc; width: 100%; }

            .account-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
            .account-table th, .account-table td { border: 1px solid #ddd; padding: 7px 5px; text-align: center; }
            .account-table th { background-color: #f8f9fa; font-weight: bold; color:#333; }
        </style>
        
        <div class="custom-navbar">
            <div class="custom-navbar-left">
                <span class="navbar-brand">YUNY_ERP</span>
                ${canDash ? `<a href="../dashboard/dashboard.html" class="${isDashboard ? 'active-menu' : ''}">📊 대시보드</a>` : ''}
                ${canAds ? `<a href="../ads/ads.html" class="${isAds ? 'active-menu' : ''}">📢 광고관리</a>` : ''}
                ${canCost ? `<a href="../cost/cost.html" class="${isCost ? 'active-menu' : ''}">📉 원가관리</a>` : ''}
                ${canSales ? `<a href="../sales/sales.html" class="${isSales ? 'active-menu' : ''}">💰 매출관리</a>` : ''}
                ${canMargin ? `<a href="../margin/margin.html" class="${isMargin ? 'active-menu' : ''}">📝 마진관리</a>` : ''}
                ${canStock ? `
                    <div class="nav-dropdown">
                        <a href="../uni-work/admin-stock.html" class="${isStock ? 'active-menu' : ''}">📦 재고표 ▾</a>
                        <div class="nav-dropdown-content">
                            <a href="../uni-work/admin-stock.html">📅 일별입출고</a>
                            <a href="../uni-work/admin-order.html">📊 입고발주표</a>
                        </div>
                    </div>` : ''}
                ${canUniwork ? `<a href="${uniworkLink}" class="${isTotal ? 'active-menu' : ''}">🛠️ 유니워크</a>` : ''}
            </div>
            <div class="navbar-user-info">
                <span class="navbar-user-name-text" id="navbar-user-name">접속자 표시중</span>
                ${canManageAccounts ? `<button class="btn-nav-action" onclick="window.openAccountManagerModal()">⚙️ 계정/권한 설정</button>` : ''}
                <button class="btn-nav-action btn-nav-orange" onclick="window.openResetPwModal()">🔑 비번 변경</button>
                <button class="btn-nav-action btn-nav-red" onclick="window.logoutSystem()">로그아웃</button>
            </div>
        </div>

        <div id="accountModal" class="account-modal-overlay">
            <div class="account-modal-card">
                <div class="account-modal-header">
                    <h3>🥷 [통합 계정 & 권한 제어] 등급별 세부 메뉴 보기/수정/모드 설정</h3>
                    <span class="account-modal-close" onclick="window.closeAccountManagerModal()">&times;</span>
                </div>
                
                <div class="account-modal-body">
                    <form id="accountForm" onsubmit="return false;" autocomplete="off">
                        <div style="display:flex; gap:8px; align-items:flex-end; background:#f8f9fa; padding:10px; border-radius:6px; border:1px solid #e9ecef;">
                            <div style="flex:1;"><label style="font-size:11px; font-weight:bold;">ID</label><input type="text" id="accInputId" style="width:100%; height:32px; font-size:12px; padding:0 6px;"></div>
                            <div style="flex:1;"><label style="font-size:11px; font-weight:bold;">비밀번호</label><input type="password" id="accInputPw" style="width:100%; height:32px; font-size:12px; padding:0 6px;"></div>
                            <div style="flex:1;"><label style="font-size:11px; font-weight:bold;">성함</label><input type="text" id="accInputName" style="width:100%; height:32px; font-size:12px; padding:0 6px;"></div>
                            <div style="flex:1.2;">
                                <label style="font-size:11px; font-weight:bold;">권한 등급</label>
                                <select id="accInputRole" style="width:100%; height:32px; font-size:12px;" onchange="window.onRoleSelectChange(this.value)">
                                    <option value="worker">직원 (worker)</option>
                                    <option value="manager">매니저 (manager)</option>
                                    <option value="admin">관리자 (admin)</option>
                                </select>
                            </div>
                            <button type="button" class="btn-nav-action" style="height:32px; padding:0 12px; background:#2c3e50; color:#fff;" onclick="window.saveAccountItem()">계정 등록/저장</button>
                        </div>

                        <div class="perm-grid-box" id="permSettingBox">
                            <div><label>📊 대시보드</label><select id="perm_dashboard"><option value="hide">숨김</option><option value="read">보기 전용</option><option value="edit" selected>수정 가능</option></select></div>
                            <div><label>📢 광고관리</label><select id="perm_ads"><option value="hide">숨김</option><option value="read">보기 전용</option><option value="edit" selected>수정 가능</option></select></div>
                            <div><label>📉 원가관리</label><select id="perm_cost"><option value="hide">숨김</option><option value="read">보기 전용</option><option value="edit" selected>수정 가능</option></select></div>
                            <div><label>💰 매출관리</label><select id="perm_sales"><option value="hide">숨김</option><option value="read">보기 전용</option><option value="edit" selected>수정 가능</option></select></div>
                            <div><label>📝 마진관리</label><select id="perm_margin"><option value="hide">숨김</option><option value="read">보기 전용</option><option value="edit" selected>수정 가능</option></select></div>
                            <div><label>📦 재고표</label><select id="perm_stock"><option value="hide">숨김</option><option value="read">보기 전용</option><option value="edit" selected>수정 가능</option></select></div>
                            <div><label>🛠️ 유니워크</label><select id="perm_uniwork"><option value="hide">숨김</option><option value="worker">직원 모드</option><option value="admin" selected>관리자 모드</option></select></div>
                            <div><label>⚙️ 계정 관리</label><select id="perm_accountMgr"><option value="self">본인 계정만</option><option value="full" selected>전체 생성/수정</option></select></div>
                        </div>
                    </form>

                    <div style="max-height: 230px; overflow-y: auto;">
                        <table class="account-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>성함</th>
                                    <th>등급</th>
                                    <th>메뉴 세부 권한 현황</th>
                                    <th>관리 기능</th>
                                </tr>
                            </thead>
                            <tbody id="accountTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div id="pwChangeModal" class="account-modal-overlay">
            <div class="account-modal-card" style="max-width:380px;">
                <div class="account-modal-header">
                    <h3>🔑 비밀번호 변경</h3>
                    <span class="account-modal-close" onclick="window.closeResetPwModal()">&times;</span>
                </div>
                <div style="margin-bottom:15px;">
                    <label style="font-size:12px; font-weight:bold; color:#495057; display:block; margin-bottom:6px;">새 비밀번호 입력</label>
                    <input type="password" id="customNewPwInput" style="width:100%; height:38px; padding:0 10px; border:1px solid #ced4da; border-radius:4px; box-sizing:border-box;" placeholder="변경할 비밀번호">
                </div>
                <div style="display:flex; justify-content:flex-end; gap:8px;">
                    <button class="btn-nav-action" style="background:#7f8c8d;" onclick="window.closeResetPwModal()">취소</button>
                    <button class="btn-nav-action btn-nav-orange" onclick="window.submitMyPasswordChange()">변경 완료</button>
                </div>
            </div>
        </div>
        `;

        navbarContainer.innerHTML = navHtml;
        window.updateNavbarUserDisplay();
        window.autoLoadGlobalUserList();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }
})();

// 🎯 [핵심] 어느 페이지에서 접속하든 구글 DB에서 계정목록 자동 수집
window.autoLoadGlobalUserList = function() {
    var scriptUrl = window.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbyPWv070zApltQFMeq6HUxFAnnBcZfpAXHz5n_vwnmX34kCXqadFumI1BfmJRWu0OZE/exec";
    
    fetch(scriptUrl + (scriptUrl.indexOf('?') > -1 ? '&' : '?') + 't=' + Date.now())
    .then(r => r.json())
    .then(data => {
        if (data && Array.isArray(data.userList)) {
            window.userList = data.userList;
            if (document.getElementById('accountModal') && document.getElementById('accountModal').style.display === 'flex') {
                window.renderAccountTable();
            }
        }
    })
    .catch(e => {
        console.log("계정 원장 수집 요청 지연중...");
    });
};

window.updateNavbarUserDisplay = function() {
    var nameEl = document.getElementById('navbar-user-name');
    if (!nameEl) return;
    var activeName = localStorage.getItem('login_user_name') || "관리자";
    var activeRole = localStorage.getItem('login_user_role') || "admin";
    var roleText = activeRole === 'admin' ? '관리자' : (activeRole === 'manager' ? '매니저' : '직원');
    nameEl.innerText = `${activeName}님(${roleText}) 접속중`;
};

window.onRoleSelectChange = function(role) {
    var isWorker = role === 'worker';
    var isManager = role === 'manager';
    var isAdmin = role === 'admin';

    var setPerm = function(dash, ads, cost, sales, margin, stock, uniwork, acc) {
        document.getElementById('perm_dashboard').value = dash;
        document.getElementById('perm_ads').value = ads;
        document.getElementById('perm_cost').value = cost;
        document.getElementById('perm_sales').value = sales;
        document.getElementById('perm_margin').value = margin;
        document.getElementById('perm_stock').value = stock;
        document.getElementById('perm_uniwork').value = uniwork;
        document.getElementById('perm_accountMgr').value = acc;
    };

    if (isWorker) setPerm('hide', 'hide', 'hide', 'hide', 'hide', 'read', 'worker', 'self');
    else if (isManager) setPerm('read', 'read', 'read', 'read', 'read', 'edit', 'admin', 'full');
    else if (isAdmin) setPerm('edit', 'edit', 'edit', 'edit', 'edit', 'edit', 'admin', 'full');
};

window.openAccountManagerModal = function() {
    window.autoLoadGlobalUserList();
    window.renderAccountTable();
    var modal = document.getElementById('accountModal');
    if (modal) modal.style.display = 'flex';
};

window.closeAccountManagerModal = function() {
    var modal = document.getElementById('accountModal');
    if (modal) modal.style.display = 'none';
};

window.renderAccountTable = function() {
    var tbody = document.getElementById('accountTableBody');
    if (!tbody) return;
    tbody.innerHTML = "";
    
    var currentUsers = window.userList || [];

    if (currentUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding:15px; color:#888;">등록된 계정 정보를 불러오는 중입니다...</td></tr>';
        return;
    }

    currentUsers.forEach(function(u, idx) {
        var tr = document.createElement('tr');
        var displayName = u.name || u.id;
        var roleBadge = u.role === 'admin' ? '<b style="color:#2980b9;">관리자</b>' : (u.role === 'manager' ? '<b style="color:#9b59b6;">매니저</b>' : '<b style="color:#27ae60;">직원</b>');
        
        var perms = u.permissions || {};
        var permSummary = `원가:${perms.cost || 'edit'} | 재고:${perms.stock || 'edit'} | 계정:${perms.accountMgr || 'self'}`;

        tr.innerHTML = `
            <td style="font-weight:bold;">${u.id}</td>
            <td style="color:#2c3e50; font-weight:bold;">${displayName}</td>
            <td>${roleBadge}</td>
            <td style="font-size:11px; color:#555;">${permSummary}</td>
            <td>
                <button class="btn-nav-action" style="height:24px; padding:0 6px; font-size:11px; background:#e67e22;" onclick="window.loadAccountToEdit(${idx})">권한수정</button>
                <button class="btn-nav-action btn-nav-red" style="height:24px; padding:0 6px; font-size:11px;" onclick="window.deleteAccountItem(${idx})">삭제</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.loadAccountToEdit = function(idx) {
    var u = window.userList[idx];
    if (!u) return;

    document.getElementById('accInputId').value = u.id;
    document.getElementById('accInputPw').value = u.pw || "";
    document.getElementById('accInputName').value = u.name || u.id;
    document.getElementById('accInputRole').value = u.role || "worker";

    var p = u.permissions || {};
    document.getElementById('perm_dashboard').value = p.dashboard || 'hide';
    document.getElementById('perm_ads').value = p.ads || 'hide';
    document.getElementById('perm_cost').value = p.cost || 'hide';
    document.getElementById('perm_sales').value = p.sales || 'hide';
    document.getElementById('perm_margin').value = p.margin || 'hide';
    document.getElementById('perm_stock').value = p.stock || 'read';
    document.getElementById('perm_uniwork').value = p.uniwork || 'worker';
    document.getElementById('perm_accountMgr').value = p.accountMgr || 'self';
};

window.saveAccountItem = function() {
    var id = document.getElementById('accInputId').value.trim();
    var pw = document.getElementById('accInputPw').value.trim();
    var name = document.getElementById('accInputName').value.trim();
    var role = document.getElementById('accInputRole').value;
    
    if (!id || !pw) { alert("ID와 비밀번호를 입력해 주세요!"); return; }
    if (!name) name = id;

    var permissions = {
        dashboard: document.getElementById('perm_dashboard').value,
        ads: document.getElementById('perm_ads').value,
        cost: document.getElementById('perm_cost').value,
        sales: document.getElementById('perm_sales').value,
        margin: document.getElementById('perm_margin').value,
        stock: document.getElementById('perm_stock').value,
        uniwork: document.getElementById('perm_uniwork').value,
        accountMgr: document.getElementById('perm_accountMgr').value
    };

    if (!window.userList) window.userList = [];
    var existingIdx = window.userList.findIndex(u => u.id === id);
    
    var userObj = { id: id, pw: pw, name: name, role: role, permissions: permissions };

    if (existingIdx > -1) {
        window.userList[existingIdx] = userObj;
    } else {
        window.userList.push(userObj);
    }

    document.getElementById('accInputId').value = "";
    document.getElementById('accInputPw').value = "";
    document.getElementById('accInputName').value = "";

    window.renderAccountTable();
    window.syncAccountDataWithGoogle();
};

window.deleteAccountItem = function(idx) {
    var targetList = window.userList || [];
    if (!targetList[idx]) return;
    if (confirm(`[${targetList[idx].id}] 계정을 삭제하시겠습니까?`)) {
        targetList.splice(idx, 1);
        window.renderAccountTable();
        window.syncAccountDataWithGoogle();
    }
};

window.syncAccountDataWithGoogle = function() {
    var scriptUrl = window.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbyPWv070zApltQFMeq6HUxFAnnBcZfpAXHz5n_vwnmX34kCXqadFumI1BfmJRWu0OZE/exec";
    var targetList = window.userList || [];
    var payload = { action: "syncUsers", userList: targetList };
    
    fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(() => { alert("계정 및 세부 권한 설정이 성공적으로 저장되었습니다."); });
};

window.openResetPwModal = function() {
    document.getElementById('customNewPwInput').value = "";
    document.getElementById('pwChangeModal').style.display = 'flex';
};

window.closeResetPwModal = function() {
    document.getElementById('pwChangeModal').style.display = 'none';
};

window.submitMyPasswordChange = function() {
    var newPw = document.getElementById('customNewPwInput').value.trim();
    if (!newPw) { alert("새 비밀번호를 입력해 주세요!"); return; }

    var activeName = localStorage.getItem('login_user_name') || "관리자";
    if (!window.userList) window.userList = [];
    
    var found = window.userList.find(u => (u.name || u.id) === activeName);
    if (found) {
        found.pw = newPw;
    }

    window.closeResetPwModal();
    window.syncAccountDataWithGoogle();
};

window.logoutSystem = function() {
    localStorage.removeItem('login_user_name');
    localStorage.removeItem('login_user_role');
    localStorage.removeItem('login_user_permissions');
    alert("로그아웃 되었습니다.");
    window.location.href = "../index.html";
};