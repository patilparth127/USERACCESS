export const SUPER_ADMIN_USER = {
  id: 'super_admin_id',
  name: 'System Administrator',
  firstName: 'System',
  lastName: 'Administrator',
  email: 'admin@system.com',
  is_active: true,
  isSuperAdmin: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  permissions: [
    {
      moduleName: 'UserManagement',
      permissions: ['User.ViewUsers', 'User.CreateUser', 'User.UpdateUser', 'User.DeleteUser']
    },
    {
      moduleName: 'ReportManagement',
      permissions: ['Report.ViewReports', 'Report.CreateReport', 'Report.UpdateReport', 'Report.DeleteReport', 'Report.ViewReportDetail']
    },
    {
      moduleName: 'FileManagement',
      permissions: ['File.ViewFiles', 'File.UploadFile', 'File.DeleteFile']
    }
  ]
};
