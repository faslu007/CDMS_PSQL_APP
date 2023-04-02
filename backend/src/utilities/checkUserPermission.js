// function to check if req.user has permission to perform requesting action to get the data.
const checkPermission = (userPermissions, path, requestType) => {
    const userPermissionsArray = userPermissions.split(',').map(Number);
    switch (path) {
        case '/register-user':
            if (requestType === 'post') {
                return userPermissionsArray.includes(3);
            }
            break;

        default:
            break;
    }
    return false
}

const permissions = {
    "1": "project_view_and_modify",
    "2": "user_management_view",
    "3": "user_management_modify",
    "4": "accounts_management_view",
    "5": "accounts_management_modify",
    "6": "inn_view",
    "7": "inn_modify", // only edit access, no permission to mark as inactive
    "8": "inn_mark_inactive",
    "9": "inn_escalate",
    "10": "onn_view",
    "11": "onn_modify",
    "12": "onn_mark_inactive",
    "13": "onn_escalate",
    "14": "edi_view",
    "15": "edi_modify",
    "16": "edi_mark_inactive",
    "17": "edi_escalate",
    "18": "issues_view",
    "19": "issues_modify",
    "20": "issues_mark_inactive",
    "21": "issues_escalate",
    "22": "pif_view",
    "23": "pif_modify",
    "24": "pif_access_sensitive", // to secure bank details and SSN from specific users
    "25": "portal_logins_view",
    "26": "portal_logins_modify",
    "27": "roles_and_permissions_view",
    "28": "roles_and_permissions_add",
    "29": "roles_and_permissions_modify",
    "30": "send_reminder_emails",
    "31": "document_management_view",
    "32": "document_management_modify",
    "33": "dashboard_user_level_view",
    "34": "dashboard_managerial_view"
};

module.exports = {
    checkPermission,
}