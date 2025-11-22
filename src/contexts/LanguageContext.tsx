import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ru';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'ru' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const translations = language === 'ru' ? translationsRu : translationsEn;
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

// English translations
const translationsEn: Record<string, string> = {
  // Header
  'header.doctors': 'Doctors',
  'header.departments': 'Departments',
  'header.users': 'Users (A)',
  'header.nurseCabinet': 'Nurse Cabinet',
  'header.indicators': 'Indicators',
  'header.cabinet': 'Cabinet',
  'header.profile': 'Profile',
  'header.settings': 'Settings',
  'header.logout': 'Log Out',
  'header.login': 'Login',
  'header.register': 'Register',

  // Home
  'home.welcome': 'Welcome to Health & Life',
  'home.subtitle': 'Your health, our priority.',

  // Auth
  'auth.login': 'Login',
  'auth.register': 'Register',
  'auth.username': 'Username',
  'auth.password': 'Password',
  'auth.email': 'Email',
  'auth.firstName': 'First Name',
  'auth.lastName': 'Last Name',
  'auth.middleName': 'Middle Name',
  'auth.confirmPassword': 'Confirm Password',

  // Cabinet
  'cabinet.title': 'Cabinet',
  'cabinet.myInformation': 'My Information',
  'cabinet.assignedDoctor': 'Assigned Doctor:',
  'cabinet.treatmentPlan': 'Treatment Plan',
  'cabinet.medicalIndicators': 'Medical Indicators',
  'cabinet.getIndicators': 'Get Indicators',
  'cabinet.stopMonitoring': 'Stop Monitoring',
  'cabinet.heartRate': 'Heart Rate:',
  'cabinet.temperature': 'Temperature:',
  'cabinet.spo2': 'SpO2:',
  'cabinet.myPatients': 'My Patients',
  'cabinet.noActivePatients': 'You currently have no active patients',
  'cabinet.getLastIndicators': 'Get Last Indicators',
  'cabinet.setTreatment': 'Set Treatment',
  'cabinet.unassignedFromDepartment': 'Unassigned Patients from My Department',
  'cabinet.allUnassigned': 'All Unassigned Patients',
  'cabinet.assign': 'Assign',
  'cabinet.department': 'Department:',
  'cabinet.allPatients': 'All Patients',
  'cabinet.assignDepartment': 'Assign Department',
  'cabinet.assignNurse': 'Assign Nurse',
  'cabinet.notAssigned': 'Not assigned',

  // Modals
  'modal.setTreatmentFor': 'Set Treatment for',
  'modal.enterTreatment': 'Enter treatment instructions...',
  'modal.save': 'Save',
  'modal.cancel': 'Cancel',
  'modal.close': 'Close',
  'modal.assignNurseTo': 'Assign Nurse to',
  'modal.selectNurse': 'Select Nurse',
  'modal.assignDepartmentTo': 'Assign Department to',
  'modal.selectDepartment': 'Select Department',
  'modal.medicalIndicators': 'Medical Indicators',
  'modal.loadingAnalysis': 'Loading indicators and analysis...',
  'modal.currentIndicators': 'Current Indicators',
  'modal.analysis': 'Analysis',
  'modal.overallStatus': 'Overall Status:',
  'modal.recommendations': 'Recommendations:',

  // Settings
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.selectLanguage': 'Select Language',
  'settings.english': 'English',
  'settings.russian': 'Русский',
  'settings.accountInfo': 'Account Information',
  'settings.username': 'Username',
  'settings.fullName': 'Full Name',
  'settings.phoneNumber': 'Phone Number',
  'settings.notSet': 'Not set',
  'settings.accountStatus': 'Account Status',
  'settings.confirmed': 'Confirmed',
  'settings.unconfirmed': 'Unconfirmed',
  'settings.memberSince': 'Member Since',
  'settings.lastUpdated': 'Last Updated',
  'settings.updateProfileNote': 'To update your profile information, please visit the',
  'settings.profilePage': 'Profile',
  'settings.page': 'page.',
  'settings.changePassword': 'Change Password',
  'settings.currentPasswordRequired': 'Current Password *',
  'settings.newPasswordRequired': 'New Password *',
  'settings.confirmNewPasswordRequired': 'Confirm New Password *',
  'settings.enterCurrentPassword': 'Enter your current password...',
  'settings.enterNewPassword': 'Enter your new password (min. 6 characters)...',
  'settings.confirmNewPassword': 'Confirm your new password...',
  'settings.passwordMismatch': 'New password and confirm password do not match',
  'settings.passwordTooShort': 'Password must be at least 6 characters long',
  'settings.passwordChangedSuccess': 'Password changed successfully!',
  'settings.changingPassword': 'Changing Password...',
  'settings.security': 'Security',
  'settings.securityInfo': 'For your security, please keep your password confidential and change it regularly.',
  'settings.securityTip1': 'Use a strong password with at least 6 characters',
  'settings.securityTip2': "Don't share your password with anyone",
  'settings.securityTip3': 'Change your password if you suspect it has been compromised',
  'settings.securityTip4': 'Log out when using shared devices',
  'settings.roleDoctor': 'Doctor',
  'settings.roleNurse': 'Nurse',
  'settings.roleAdmin': 'Administrator',
  'settings.rolePatient': 'Patient',
  'settings.roleDefault': 'User',

  // Profile
  'profile.title': 'Profile',
  'profile.updateProfile': 'Update Profile',
  'profile.changePassword': 'Change Password',
  'profile.currentPassword': 'Current Password',
  'profile.newPassword': 'New Password',
  'profile.generalInfo': 'General Information',
  'profile.contactInfo': 'Contact Information',
  'profile.avatar': 'Avatar',
  'profile.changeAvatar': 'Change Avatar',
  'profile.saveChanges': 'Save Changes',
  'profile.saving': 'Saving...',

  // Common
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.update': 'Update',
  'common.create': 'Create',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.all': 'All',
  'common.name': 'Name',
  'common.email': 'Email',
  'common.phone': 'Phone',
  'common.role': 'Role',
  'common.status': 'Status',
  'common.actions': 'Actions',
  'common.confirm': 'Confirm',
  'common.yes': 'Yes',
  'common.no': 'No',
  
  // Doctors
  'doctors.title': 'Doctors',
  'doctors.searchDoctors': 'Search doctors...',
  'doctors.allDepartments': 'All Departments',
  'doctors.noDoctors': 'No doctors found',
  'doctors.found': 'found',
  'doctors.doctor': 'doctor',
  'doctors.doctors': 'doctors',
  'doctors.department': 'Department:',
  'doctors.email': 'Email:',
  'doctors.phone': 'Phone:',
  
  // Departments
  'departments.title': 'Departments',
  'departments.createDepartment': 'Create Department',
  'departments.departmentName': 'Department Name',
  'departments.description': 'Description',
  'departments.noDepartments': 'No departments found',
  'departments.member': 'member',
  'departments.members': 'members',
  'departments.noPermission': 'You do not have permission to view departments',
  
  // Nurse Cabinet
  'nurseCabinet.title': 'Nurse Cabinet',
  'nurseCabinet.myPatients': 'My Patients',
  'nurseCabinet.notifications': 'Notifications',
  'nurseCabinet.noPatients': 'No patients assigned',
  'nurseCabinet.noNotifications': 'No notifications',
  
  // Medical Indicators
  'indicators.title': 'Medical Indicators',
  'indicators.inputIndicators': 'Input Indicators',
  'indicators.patientId': 'Patient ID:',
  'indicators.heartRate': 'Heart Rate (bpm):',
  'indicators.temperature': 'Temperature (°C):',
  'indicators.spo2': 'SpO2 (%):',
  'indicators.submit': 'Submit',
  'indicators.analyze': 'Analyze',
  'indicators.loadLatest': 'Load Latest',
  'indicators.randomNormal': 'Random Normal',
  'indicators.randomCritical': 'Random Critical',
  'indicators.submitResponse': 'Submit Response',
  'indicators.analysisResults': 'Analysis Results',
  
  // Admin Users
  'adminUsers.title': 'Users (A)',
  'adminUsers.searchPlaceholder': 'Search by name, username, email, or ID...',
  'adminUsers.userId': 'User ID',
  'adminUsers.startDate': 'Start Date',
  'adminUsers.endDate': 'End Date',
  'adminUsers.noUsers': 'No users found',
  'adminUsers.usersFound': 'users found',
  'adminUsers.userFound': 'user found',
  'adminUsers.selected': 'selected',
  'adminUsers.bulkOperations': 'Bulk Operations',
  'adminUsers.allRoles': 'All Roles',
  
  // Bulk Operations
  'bulk.title': 'Bulk Operations',
  'bulk.selectedUsers': 'Selected users:',
  'bulk.bulkConfirm': 'Bulk Confirm Users',
  'bulk.bulkUpdate': 'Bulk Update Users',
  'bulk.confirmUsers': 'Confirm Users',
  'bulk.confirmQuestion': 'Are you sure you want to confirm',
  'bulk.users': 'users?',
  'bulk.confirming': 'Confirming...',
  'bulk.updateUsers': 'Update Users',
  'bulk.updating': 'Updating',
  'bulk.departmentId': 'Department ID (optional):',
  'bulk.roleOptional': 'Role (optional):',
  'bulk.noChange': '-- No change --',
  'bulk.markConfirmed': 'Mark as Confirmed',
  'bulk.back': 'Back',
  
  // Auth Modal
  'authModal.createAccount': 'Create account',
  'authModal.login': 'Login',
  'authModal.pleaseWait': 'Please wait…',
  
  // Avatar Edit Modal
  'avatarEdit.changeAvatar': 'Change Avatar',
  'avatarEdit.uploadFromComputer': 'Upload from Computer',
  'avatarEdit.enterUrl': 'Enter URL',
  'avatarEdit.chooseFile': 'Choose File',
  'avatarEdit.urlPlaceholder': 'https://example.com/image.jpg',
  
  // Department Modal
  'departmentModal.createDepartment': 'Create Department',
  'departmentModal.updateDepartment': 'Update Department',
  'departmentModal.deleteDepartment': 'Delete Department',
  'departmentModal.deleteConfirm': 'Are you sure you want to delete the department',
  'departmentModal.cannotUndo': 'This action cannot be undone.',
  'departmentModal.nameRequired': 'Name *',
  'departmentModal.enterName': 'Enter department name...',
  'departmentModal.enterDescription': 'Enter department description...',
  'departmentModal.deleting': 'Deleting...',
  
  // User Edit Modal
  'userEdit.editUser': 'Edit User',
  'userEdit.enterFirstName': 'Enter first name...',
  'userEdit.enterLastName': 'Enter last name...',
  'userEdit.enterMiddleName': 'Enter middle name...',
  'userEdit.enterEmail': 'Enter email...',
  'userEdit.phoneNumber': 'Phone Number',
  'userEdit.enterPhone': 'Enter phone number...',
  'userEdit.roleRequired': 'Role *',
  'userEdit.noDepartment': 'No Department',
  
  // User Delete Modal
  'userDelete.deleteUser': 'Delete User',
  'userDelete.confirmDelete': 'Are you sure you want to delete the user',
  
  // Notifications
  'notifications.title': 'Notifications',
  'notifications.unread': 'unread',
  'notifications.allCaughtUp': 'All caught up',
  'notifications.markAllRead': 'Mark all read',
  'notifications.noNotifications': 'No notifications yet',
  'notifications.justNow': 'just now',
  'notifications.minAgo': 'min ago',
  'notifications.minsAgo': 'mins ago',
  'notifications.hourAgo': 'hour ago',
  'notifications.hoursAgo': 'hours ago',
  'notifications.dayAgo': 'day ago',
  'notifications.daysAgo': 'days ago',
};

// Russian translations
const translationsRu: Record<string, string> = {
  // Header
  'header.doctors': 'Врачи',
  'header.departments': 'Отделения',
  'header.users': 'Пользователи (А)',
  'header.nurseCabinet': 'Кабинет медсестры',
  'header.indicators': 'Показатели',
  'header.cabinet': 'Кабинет',
  'header.profile': 'Профиль',
  'header.settings': 'Настройки',
  'header.logout': 'Выйти',
  'header.login': 'Войти',
  'header.register': 'Регистрация',

  // Home
  'home.welcome': 'Добро пожаловать в Health & Life',
  'home.subtitle': 'Ваше здоровье - наш приоритет.',

  // Auth
  'auth.login': 'Войти',
  'auth.register': 'Регистрация',
  'auth.username': 'Имя пользователя',
  'auth.password': 'Пароль',
  'auth.email': 'Email',
  'auth.firstName': 'Имя',
  'auth.lastName': 'Фамилия',
  'auth.middleName': 'Отчество',
  'auth.confirmPassword': 'Подтвердите пароль',

  // Cabinet
  'cabinet.title': 'Кабинет',
  'cabinet.myInformation': 'Моя информация',
  'cabinet.assignedDoctor': 'Назначенный врач:',
  'cabinet.treatmentPlan': 'План лечения',
  'cabinet.medicalIndicators': 'Медицинские показатели',
  'cabinet.getIndicators': 'Получить показатели',
  'cabinet.stopMonitoring': 'Остановить мониторинг',
  'cabinet.heartRate': 'Пульс:',
  'cabinet.temperature': 'Температура:',
  'cabinet.spo2': 'SpO2:',
  'cabinet.myPatients': 'Мои пациенты',
  'cabinet.noActivePatients': 'На данный момент у Вас нет активных пациентов',
  'cabinet.getLastIndicators': 'Получить последние показатели',
  'cabinet.setTreatment': 'Назначить лечение',
  'cabinet.unassignedFromDepartment': 'Неназначенные пациенты из моего отделения',
  'cabinet.allUnassigned': 'Все неназначенные пациенты',
  'cabinet.assign': 'Назначить',
  'cabinet.department': 'Отделение:',
  'cabinet.allPatients': 'Все пациенты',
  'cabinet.assignDepartment': 'Назначить отделение',
  'cabinet.assignNurse': 'Назначить медсестру',
  'cabinet.notAssigned': 'Не назначен',

  // Modals
  'modal.setTreatmentFor': 'Назначить лечение для',
  'modal.enterTreatment': 'Введите инструкции по лечению...',
  'modal.save': 'Сохранить',
  'modal.cancel': 'Отмена',
  'modal.close': 'Закрыть',
  'modal.assignNurseTo': 'Назначить медсестру для',
  'modal.selectNurse': 'Выберите медсестру',
  'modal.assignDepartmentTo': 'Назначить отделение для',
  'modal.selectDepartment': 'Выберите отделение',
  'modal.medicalIndicators': 'Медицинские показатели',
  'modal.loadingAnalysis': 'Загрузка показателей и анализа...',
  'modal.currentIndicators': 'Текущие показатели',
  'modal.analysis': 'Анализ',
  'modal.overallStatus': 'Общий статус:',
  'modal.recommendations': 'Рекомендации:',

  // Settings
  'settings.title': 'Настройки',
  'settings.language': 'Язык',
  'settings.selectLanguage': 'Выберите язык',
  'settings.english': 'English',
  'settings.russian': 'Русский',
  'settings.accountInfo': 'Информация об аккаунте',
  'settings.username': 'Имя пользователя',
  'settings.fullName': 'Полное имя',
  'settings.phoneNumber': 'Номер телефона',
  'settings.notSet': 'Не указано',
  'settings.accountStatus': 'Статус аккаунта',
  'settings.confirmed': 'Подтвержден',
  'settings.unconfirmed': 'Не подтвержден',
  'settings.memberSince': 'Дата регистрации',
  'settings.lastUpdated': 'Последнее обновление',
  'settings.updateProfileNote': 'Чтобы обновить информацию профиля, перейдите на страницу',
  'settings.profilePage': 'Профиль',
  'settings.page': '.',
  'settings.changePassword': 'Изменить пароль',
  'settings.currentPasswordRequired': 'Текущий пароль *',
  'settings.newPasswordRequired': 'Новый пароль *',
  'settings.confirmNewPasswordRequired': 'Подтвердите новый пароль *',
  'settings.enterCurrentPassword': 'Введите текущий пароль...',
  'settings.enterNewPassword': 'Введите новый пароль (мин. 6 символов)...',
  'settings.confirmNewPassword': 'Подтвердите новый пароль...',
  'settings.passwordMismatch': 'Новый пароль и подтверждение не совпадают',
  'settings.passwordTooShort': 'Пароль должен содержать минимум 6 символов',
  'settings.passwordChangedSuccess': 'Пароль успешно изменен!',
  'settings.changingPassword': 'Изменение пароля...',
  'settings.security': 'Безопасность',
  'settings.securityInfo': 'Для вашей безопасности храните пароль в секрете и регулярно меняйте его.',
  'settings.securityTip1': 'Используйте надежный пароль длиной не менее 6 символов',
  'settings.securityTip2': 'Не сообщайте свой пароль никому',
  'settings.securityTip3': 'Измените пароль, если подозреваете, что он был скомпрометирован',
  'settings.securityTip4': 'Выходите из системы при использовании общих устройств',
  'settings.roleDoctor': 'Врач',
  'settings.roleNurse': 'Медсестра',
  'settings.roleAdmin': 'Администратор',
  'settings.rolePatient': 'Пациент',
  'settings.roleDefault': 'Пользователь',

  // Profile
  'profile.title': 'Профиль',
  'profile.updateProfile': 'Обновить профиль',
  'profile.changePassword': 'Изменить пароль',
  'profile.currentPassword': 'Текущий пароль',
  'profile.newPassword': 'Новый пароль',
  'profile.generalInfo': 'Общая информация',
  'profile.contactInfo': 'Контактная информация',
  'profile.avatar': 'Аватар',
  'profile.changeAvatar': 'Изменить аватар',
  'profile.saveChanges': 'Сохранить изменения',
  'profile.saving': 'Сохранение...',

  // Common
  'common.loading': 'Загрузка...',
  'common.error': 'Ошибка',
  'common.success': 'Успешно',
  'common.delete': 'Удалить',
  'common.edit': 'Редактировать',
  'common.update': 'Обновить',
  'common.create': 'Создать',
  'common.search': 'Поиск',
  'common.filter': 'Фильтр',
  'common.all': 'Все',
  'common.name': 'Имя',
  'common.email': 'Email',
  'common.phone': 'Телефон',
  'common.role': 'Роль',
  'common.status': 'Статус',
  'common.actions': 'Действия',
  'common.confirm': 'Подтвердить',
  'common.yes': 'Да',
  'common.no': 'Нет',
  
  // Doctors
  'doctors.title': 'Врачи',
  'doctors.searchDoctors': 'Поиск врачей...',
  'doctors.allDepartments': 'Все отделения',
  'doctors.noDoctors': 'Врачи не найдены',
  'doctors.found': 'найдено',
  'doctors.doctor': 'врач',
  'doctors.doctors': 'врачей',
  'doctors.department': 'Отделение:',
  'doctors.email': 'Email:',
  'doctors.phone': 'Телефон:',
  
  // Departments
  'departments.title': 'Отделения',
  'departments.createDepartment': 'Создать отделение',
  'departments.departmentName': 'Название отделения',
  'departments.description': 'Описание',
  'departments.noDepartments': 'Отделения не найдены',
  'departments.member': 'сотрудник',
  'departments.members': 'сотрудников',
  'departments.noPermission': 'У вас нет прав для просмотра отделений',
  
  // Nurse Cabinet
  'nurseCabinet.title': 'Кабинет медсестры',
  'nurseCabinet.myPatients': 'Мои пациенты',
  'nurseCabinet.notifications': 'Уведомления',
  'nurseCabinet.noPatients': 'Нет назначенных пациентов',
  'nurseCabinet.noNotifications': 'Нет уведомлений',
  
  // Medical Indicators
  'indicators.title': 'Медицинские показатели',
  'indicators.inputIndicators': 'Ввод показателей',
  'indicators.patientId': 'ID пациента:',
  'indicators.heartRate': 'Пульс (уд/мин):',
  'indicators.temperature': 'Температура (°C):',
  'indicators.spo2': 'SpO2 (%):',
  'indicators.submit': 'Отправить',
  'indicators.analyze': 'Анализировать',
  'indicators.loadLatest': 'Загрузить последние',
  'indicators.randomNormal': 'Случайные нормальные',
  'indicators.randomCritical': 'Случайные критические',
  'indicators.submitResponse': 'Ответ отправки',
  'indicators.analysisResults': 'Результаты анализа',
  
  // Admin Users
  'adminUsers.title': 'Пользователи (А)',
  'adminUsers.searchPlaceholder': 'Поиск по имени, логину, email или ID...',
  'adminUsers.userId': 'ID пользователя',
  'adminUsers.startDate': 'Дата начала',
  'adminUsers.endDate': 'Дата окончания',
  'adminUsers.noUsers': 'Пользователи не найдены',
  'adminUsers.usersFound': 'пользователей найдено',
  'adminUsers.userFound': 'пользователь найден',
  'adminUsers.selected': 'выбрано',
  'adminUsers.bulkOperations': 'Массовые операции',
  'adminUsers.allRoles': 'Все роли',
  
  // Bulk Operations
  'bulk.title': 'Массовые операции',
  'bulk.selectedUsers': 'Выбрано пользователей:',
  'bulk.bulkConfirm': 'Массовое подтверждение',
  'bulk.bulkUpdate': 'Массовое обновление',
  'bulk.confirmUsers': 'Подтвердить пользователей',
  'bulk.confirmQuestion': 'Вы уверены, что хотите подтвердить',
  'bulk.users': 'пользователей?',
  'bulk.confirming': 'Подтверждение...',
  'bulk.updateUsers': 'Обновить пользователей',
  'bulk.updating': 'Обновление',
  'bulk.departmentId': 'ID отделения (опционально):',
  'bulk.roleOptional': 'Роль (опционально):',
  'bulk.noChange': '-- Без изменений --',
  'bulk.markConfirmed': 'Отметить как подтвержденных',
  'bulk.back': 'Назад',
  
  // Auth Modal
  'authModal.createAccount': 'Создать аккаунт',
  'authModal.login': 'Войти',
  'authModal.pleaseWait': 'Пожалуйста, подождите…',
  
  // Avatar Edit Modal
  'avatarEdit.changeAvatar': 'Изменить аватар',
  'avatarEdit.uploadFromComputer': 'Загрузить с компьютера',
  'avatarEdit.enterUrl': 'Ввести URL',
  'avatarEdit.chooseFile': 'Выбрать файл',
  'avatarEdit.urlPlaceholder': 'https://example.com/image.jpg',
  
  // Department Modal
  'departmentModal.createDepartment': 'Создать отделение',
  'departmentModal.updateDepartment': 'Обновить отделение',
  'departmentModal.deleteDepartment': 'Удалить отделение',
  'departmentModal.deleteConfirm': 'Вы уверены, что хотите удалить отделение',
  'departmentModal.cannotUndo': 'Это действие нельзя отменить.',
  'departmentModal.nameRequired': 'Название *',
  'departmentModal.enterName': 'Введите название отделения...',
  'departmentModal.enterDescription': 'Введите описание отделения...',
  'departmentModal.deleting': 'Удаление...',
  
  // User Edit Modal
  'userEdit.editUser': 'Редактировать пользователя',
  'userEdit.enterFirstName': 'Введите имя...',
  'userEdit.enterLastName': 'Введите фамилию...',
  'userEdit.enterMiddleName': 'Введите отчество...',
  'userEdit.enterEmail': 'Введите email...',
  'userEdit.phoneNumber': 'Номер телефона',
  'userEdit.enterPhone': 'Введите номер телефона...',
  'userEdit.roleRequired': 'Роль *',
  'userEdit.noDepartment': 'Без отделения',
  
  // User Delete Modal
  'userDelete.deleteUser': 'Удалить пользователя',
  'userDelete.confirmDelete': 'Вы уверены, что хотите удалить пользователя',
  
  // Notifications
  'notifications.title': 'Уведомления',
  'notifications.unread': 'непрочитанных',
  'notifications.allCaughtUp': 'Все прочитано',
  'notifications.markAllRead': 'Отметить все как прочитанные',
  'notifications.noNotifications': 'Пока нет уведомлений',
  'notifications.justNow': 'только что',
  'notifications.minAgo': 'мин назад',
  'notifications.minsAgo': 'мин назад',
  'notifications.hourAgo': 'час назад',
  'notifications.hoursAgo': 'часов назад',
  'notifications.dayAgo': 'день назад',
  'notifications.daysAgo': 'дней назад',
};
