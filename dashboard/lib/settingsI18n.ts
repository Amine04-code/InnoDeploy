import type { GitProviderOption, LanguagePreference, MemberRole } from "@/types";

type MessageValue = Record<LanguagePreference, string>;

const messages: Record<string, MessageValue> = {
  "settings.title": {
    english: "Settings",
    french: "Parametres",
    arabic: "الاعدادات",
  },
  "settings.subtitle": {
    english: "Configure organisation identity, access, integrations, and operator preferences.",
    french: "Configurez l'identite de l'organisation, les acces, les integrations et les preferences operateur.",
    arabic: "قم باعداد هوية المؤسسة والصلاحيات والتكاملات وتفضيلات المشغل.",
  },
  "settings.refresh": {
    english: "Refresh",
    french: "Actualiser",
    arabic: "تحديث",
  },
  "settings.loading": {
    english: "Loading settings...",
    french: "Chargement des parametres...",
    arabic: "جار تحميل الاعدادات...",
  },
  "settings.workspaceControls.title": {
    english: "Workspace Controls",
    french: "Controles de l'espace de travail",
    arabic: "عناصر تحكم مساحة العمل",
  },
  "settings.workspaceControls.description": {
    english: "Personal appearance settings and local operating defaults.",
    french: "Parametres d'apparence personnelle et valeurs par defaut locales.",
    arabic: "اعدادات المظهر الشخصية والقيم الافتراضية المحلية.",
  },
  "settings.theme": {
    english: "Theme",
    french: "Theme",
    arabic: "المظهر",
  },
  "settings.language": {
    english: "Language",
    french: "Langue",
    arabic: "اللغة",
  },
  "settings.preferencesHint": {
    english: "Theme and language choices apply immediately and are saved as your personal workspace defaults.",
    french: "Les choix de theme et de langue s'appliquent immediatement et sont enregistres comme valeurs par defaut personnelles.",
    arabic: "يتم تطبيق اختيارات المظهر واللغة فورا ويتم حفظها كتفضيلاتك الافتراضية.",
  },
  "settings.savePreferences": {
    english: "Save preferences",
    french: "Enregistrer les preferences",
    arabic: "حفظ التفضيلات",
  },
  "settings.saving": {
    english: "Saving...",
    french: "Enregistrement...",
    arabic: "جار الحفظ...",
  },
  "theme.light": {
    english: "Light",
    french: "Clair",
    arabic: "فاتح",
  },
  "theme.dark": {
    english: "Dark",
    french: "Sombre",
    arabic: "داكن",
  },
  "theme.system": {
    english: "System",
    french: "Systeme",
    arabic: "النظام",
  },
  "language.english": {
    english: "English",
    french: "Anglais",
    arabic: "الانجليزية",
  },
  "language.french": {
    english: "French",
    french: "Francais",
    arabic: "الفرنسية",
  },
  "language.arabic": {
    english: "Arabic",
    french: "Arabe",
    arabic: "العربية",
  },
  "org.title": {
    english: "Organisation Profile",
    french: "Profil de l'organisation",
    arabic: "ملف المؤسسة",
  },
  "org.description": {
    english: "Update your workspace identity, slug, and billing contact details.",
    french: "Mettez a jour l'identite de votre espace, le slug et les informations de facturation.",
    arabic: "حدّث هوية مساحة العمل والاسم المختصر وتفاصيل الفوترة.",
  },
  "org.name": {
    english: "Organisation name",
    french: "Nom de l'organisation",
    arabic: "اسم المؤسسة",
  },
  "org.slug": {
    english: "Slug",
    french: "Slug",
    arabic: "المعرف",
  },
  "org.billingEmail": {
    english: "Billing email",
    french: "Email de facturation",
    arabic: "بريد الفوترة",
  },
  "org.taxId": {
    english: "Tax ID",
    french: "ID fiscal",
    arabic: "الرقم الضريبي",
  },
  "org.companyAddress": {
    english: "Company address",
    french: "Adresse de l'entreprise",
    arabic: "عنوان الشركة",
  },
  "org.currentPlan": {
    english: "Current plan",
    french: "Plan actuel",
    arabic: "الخطة الحالية",
  },
  "org.save": {
    english: "Save organisation",
    french: "Enregistrer l'organisation",
    arabic: "حفظ المؤسسة",
  },
  "members.title": {
    english: "Members",
    french: "Membres",
    arabic: "الاعضاء",
  },
  "members.description": {
    english: "Manage access across owners, admins, developers, and viewers.",
    french: "Gerez les acces des proprietaires, administrateurs, developpeurs et observateurs.",
    arabic: "ادارة صلاحيات المالكين والمديرين والمطورين والمشاهدين.",
  },
  "members.member": {
    english: "Member",
    french: "Membre",
    arabic: "العضو",
  },
  "members.role": {
    english: "Role",
    french: "Role",
    arabic: "الدور",
  },
  "members.joined": {
    english: "Joined",
    french: "Ajoute le",
    arabic: "تاريخ الانضمام",
  },
  "members.actions": {
    english: "Actions",
    french: "Actions",
    arabic: "الاجراءات",
  },
  "members.remove": {
    english: "Remove",
    french: "Retirer",
    arabic: "ازالة",
  },
  "members.noAccess": {
    english: "No access",
    french: "Aucun acces",
    arabic: "لا توجد صلاحية",
  },
  "members.pendingInvitations": {
    english: "Pending invitations",
    french: "Invitations en attente",
    arabic: "الدعوات المعلقة",
  },
  "members.noInvites": {
    english: "No pending invites.",
    french: "Aucune invitation en attente.",
    arabic: "لا توجد دعوات معلقة.",
  },
  "members.revoke": {
    english: "Revoke",
    french: "Revoquer",
    arabic: "الغاء",
  },
  "members.inviteMember": {
    english: "Invite member",
    french: "Inviter un membre",
    arabic: "دعوة عضو",
  },
  "members.closeInvite": {
    english: "Close invite",
    french: "Fermer l'invitation",
    arabic: "اغلاق الدعوة",
  },
  "members.email": {
    english: "Email",
    french: "Email",
    arabic: "البريد الالكتروني",
  },
  "members.sendInvite": {
    english: "Send invite",
    french: "Envoyer l'invitation",
    arabic: "ارسال الدعوة",
  },
  "members.inviting": {
    english: "Inviting...",
    french: "Invitation...",
    arabic: "جار ارسال الدعوة...",
  },
  "notifications.title": {
    english: "Notification Channels",
    french: "Canaux de notification",
    arabic: "قنوات الاشعارات",
  },
  "notifications.description": {
    english: "Configure email, Slack, Discord, Expo push, and generic webhook delivery for operational alerts.",
    french: "Configurez les notifications par email, Slack, Discord, Expo Push et webhook generic.",
    arabic: "قم باعداد التنبيهات عبر البريد وسلاك وديسكورد وExpo Push وWebhook.",
  },
  "notifications.save": {
    english: "Save channels",
    french: "Enregistrer les canaux",
    arabic: "حفظ القنوات",
  },
  "notifications.testEnabled": {
    english: "Test enabled",
    french: "Tester les canaux actifs",
    arabic: "اختبار القنوات المفعلة",
  },
  "notifications.testEmail": {
    english: "Test email",
    french: "Tester email",
    arabic: "اختبار البريد",
  },
  "notifications.testSlack": {
    english: "Test slack",
    french: "Tester Slack",
    arabic: "اختبار سلاك",
  },
  "notifications.testDiscord": {
    english: "Test discord",
    french: "Tester Discord",
    arabic: "اختبار ديسكورد",
  },
  "notifications.testExpo": {
    english: "Test expo",
    french: "Tester Expo",
    arabic: "اختبار اكسبو",
  },
  "notifications.testWebhook": {
    english: "Test webhook",
    french: "Tester webhook",
    arabic: "اختبار webhook",
  },
  "notifications.maskedHint": {
    english: "Secret values may appear masked as ********. Leave masked values unchanged to keep existing secrets.",
    french: "Les valeurs secretes peuvent apparaitre masquees en ********. Laissez-les telles quelles pour conserver les secrets existants.",
    arabic: "قد تظهر القيم السرية على شكل ********. اتركها كما هي للاحتفاظ بالاسرار الحالية.",
  },
  "notifications.slack": {
    english: "Slack",
    french: "Slack",
    arabic: "سلاك",
  },
  "notifications.discord": {
    english: "Discord",
    french: "Discord",
    arabic: "ديسكورد",
  },
  "notifications.expo": {
    english: "Expo Push",
    french: "Expo Push",
    arabic: "اكسبو Push",
  },
  "notifications.webhook": {
    english: "Generic Webhook",
    french: "Webhook generic",
    arabic: "Webhook عام",
  },
  "notifications.slackWebhook": {
    english: "Slack webhook",
    french: "Webhook Slack",
    arabic: "Webhook سلاك",
  },
  "notifications.discordWebhook": {
    english: "Discord webhook",
    french: "Webhook Discord",
    arabic: "Webhook ديسكورد",
  },
  "notifications.smtpHost": {
    english: "SMTP host",
    french: "Hote SMTP",
    arabic: "خادم SMTP",
  },
  "notifications.smtpPort": {
    english: "SMTP port",
    french: "Port SMTP",
    arabic: "منفذ SMTP",
  },
  "notifications.smtpUsername": {
    english: "SMTP username",
    french: "Nom d'utilisateur SMTP",
    arabic: "اسم مستخدم SMTP",
  },
  "notifications.smtpPassword": {
    english: "SMTP password",
    french: "Mot de passe SMTP",
    arabic: "كلمة مرور SMTP",
  },
  "notifications.smtpFrom": {
    english: "SMTP from",
    french: "SMTP from",
    arabic: "بريد الارسال SMTP",
  },
  "notifications.emailRecipients": {
    english: "Email recipients (comma-separated)",
    french: "Destinataires email (separes par des virgules)",
    arabic: "مستلمو البريد (مفصولة بفواصل)",
  },
  "notifications.expoAccessToken": {
    english: "Expo access token",
    french: "Jeton d'acces Expo",
    arabic: "رمز وصول Expo",
  },
  "notifications.expoPushTokens": {
    english: "Expo push tokens (comma-separated)",
    french: "Jetons Expo Push (separes par des virgules)",
    arabic: "رموز Expo Push (مفصولة بفواصل)",
  },
  "notifications.webhookUrl": {
    english: "Generic webhook URL",
    french: "URL webhook generic",
    arabic: "رابط webhook العام",
  },
  "notifications.webhookHeaders": {
    english: "Webhook headers (comma-separated: Header-Name: value)",
    french: "Entetes webhook (separes par virgules : Header-Name: value)",
    arabic: "رؤوس webhook (مفصولة بفواصل: Header-Name: value)",
  },
  "registry.title": {
    english: "Docker Registry",
    french: "Registre Docker",
    arabic: "سجل Docker",
  },
  "registry.description": {
    english: "Store registry credentials for private image pulls and pushes.",
    french: "Stockez les identifiants du registre pour les images privees.",
    arabic: "احفظ بيانات اعتماد السجل لسحب ودفع الصور الخاصة.",
  },
  "registry.url": {
    english: "Registry URL",
    french: "URL du registre",
    arabic: "رابط السجل",
  },
  "registry.namespace": {
    english: "Namespace",
    french: "Espace de noms",
    arabic: "المساحة",
  },
  "registry.username": {
    english: "Username",
    french: "Nom d'utilisateur",
    arabic: "اسم المستخدم",
  },
  "registry.password": {
    english: "Password",
    french: "Mot de passe",
    arabic: "كلمة المرور",
  },
  "registry.save": {
    english: "Save registry",
    french: "Enregistrer le registre",
    arabic: "حفظ السجل",
  },
  "provider.title": {
    english: "Git Provider",
    french: "Fournisseur Git",
    arabic: "مزود Git",
  },
  "provider.description": {
    english: "Connect your source provider and keep webhook credentials in one place.",
    french: "Connectez votre fournisseur source et centralisez les identifiants webhook.",
    arabic: "اربط مزود المستودعات واحتفظ ببيانات webhook في مكان واحد.",
  },
  "provider.provider": {
    english: "Provider",
    french: "Fournisseur",
    arabic: "المزود",
  },
  "provider.owner": {
    english: "Repository owner / workspace",
    french: "Proprietaire du depot / espace",
    arabic: "مالك المستودع / مساحة العمل",
  },
  "provider.installationUrl": {
    english: "Installation URL",
    french: "URL d'installation",
    arabic: "رابط التثبيت",
  },
  "provider.webhookSecret": {
    english: "Webhook secret",
    french: "Secret webhook",
    arabic: "سر webhook",
  },
  "provider.save": {
    english: "Save provider",
    french: "Enregistrer le fournisseur",
    arabic: "حفظ المزود",
  },
  "provider.webhookGuide": {
    english: "Webhook guide: point your provider webhook to /api/webhooks/{provider} and reuse the secret stored here.",
    french: "Guide webhook : pointez le webhook vers /api/webhooks/{provider} et reutilisez le secret stocke ici.",
    arabic: "دليل webhook: وجه webhook الى /api/webhooks/{provider} واعد استخدام السر المحفوظ هنا.",
  },
  "apiKeys.title": {
    english: "API Keys",
    french: "Cles API",
    arabic: "مفاتيح API",
  },
  "apiKeys.description": {
    english: "Generate and revoke organisation-scoped CLI credentials.",
    french: "Generez et revoquez les identifiants CLI de l'organisation.",
    arabic: "انشئ والغ مفاتيح CLI الخاصة بالمؤسسة.",
  },
  "apiKeys.keyName": {
    english: "Key name",
    french: "Nom de la cle",
    arabic: "اسم المفتاح",
  },
  "apiKeys.generate": {
    english: "Generate key",
    french: "Generer une cle",
    arabic: "انشاء مفتاح",
  },
  "apiKeys.generating": {
    english: "Generating...",
    french: "Generation...",
    arabic: "جار الانشاء...",
  },
  "apiKeys.copyNow": {
    english: "Copy this key now. It will not be shown again.",
    french: "Copiez cette cle maintenant. Elle ne sera plus affichee.",
    arabic: "انسخ هذا المفتاح الان. لن يتم عرضه مرة اخرى.",
  },
  "apiKeys.copy": {
    english: "Copy",
    french: "Copier",
    arabic: "نسخ",
  },
  "apiKeys.none": {
    english: "No API keys generated yet.",
    french: "Aucune cle API generee pour le moment.",
    arabic: "لا توجد مفاتيح API بعد.",
  },
  "apiKeys.created": {
    english: "created",
    french: "cree le",
    arabic: "تم الانشاء",
  },
  "apiKeys.revoked": {
    english: "revoked",
    french: "revoquee",
    arabic: "ملغى",
  },
  "apiKeys.active": {
    english: "active",
    french: "active",
    arabic: "نشط",
  },
  "apiKeys.revoke": {
    english: "Revoke",
    french: "الغاء",
    arabic: "الغاء",
  },
  "danger.title": {
    english: "Danger Zone",
    french: "Zone de danger",
    arabic: "منطقة الخطر",
  },
  "danger.description": {
    english: "Delete the organisation and all related projects, hosts, and alerts.",
    french: "Supprimez l'organisation et tous les projets, hotes et alertes associes.",
    arabic: "احذف المؤسسة وكل المشاريع والمضيفين والتنبيهات المرتبطة.",
  },
  "danger.confirmPrompt": {
    english: "Type {slug} to confirm. This operation cannot be undone.",
    french: "Tapez {slug} pour confirmer. Cette operation est irreversible.",
    arabic: "اكتب {slug} للتأكيد. لا يمكن التراجع عن هذه العملية.",
  },
  "danger.confirmation": {
    english: "Confirmation",
    french: "Confirmation",
    arabic: "تأكيد",
  },
  "danger.deleteOrganisation": {
    english: "Delete organisation",
    french: "Supprimer l'organisation",
    arabic: "حذف المؤسسة",
  },
  "danger.deleting": {
    english: "Deleting...",
    french: "Suppression...",
    arabic: "جار الحذف...",
  },
  "accessPosture.title": {
    english: "Access Posture",
    french: "Posture d'acces",
    arabic: "وضعية الوصول",
  },
  "accessPosture.description": {
    english: "Current role and platform guardrails for this workspace.",
    french: "Role actuel et garde-fous de la plateforme pour cet espace.",
    arabic: "الدور الحالي وضوابط المنصة لهذه المساحة.",
  },
  "accessPosture.yourRole": {
    english: "Your role: {role}",
    french: "Votre role : {role}",
    arabic: "دورك: {role}",
  },
  "accessPosture.hint": {
    english: "Owners can delete the organisation. Owners and admins can manage members, integrations, and API keys.",
    french: "Les proprietaires peuvent supprimer l'organisation. Les proprietaires et administrateurs peuvent gerer les membres, integrations et cles API.",
    arabic: "يمكن للمالكين حذف المؤسسة. ويمكن للمالكين والمديرين ادارة الاعضاء والتكاملات ومفاتيح API.",
  },
  "accessPosture.storage": {
    english: "Git provider, Docker registry, and outbound notification credentials are organisation-scoped and currently stored directly in MongoDB for this workspace.",
    french: "Les identifiants Git, registre Docker et notifications sortantes sont portes a l'echelle de l'organisation et stockes dans MongoDB pour cet espace.",
    arabic: "بيانات اعتماد مزود Git وسجل Docker واشعارات الخروج تخص المؤسسة ويتم حفظها حاليا في MongoDB لهذه المساحة.",
  },
};

const roleLabels: Record<MemberRole, MessageValue> = {
  owner: { english: "owner", french: "proprietaire", arabic: "مالك" },
  admin: { english: "admin", french: "administrateur", arabic: "مدير" },
  developer: { english: "developer", french: "developpeur", arabic: "مطور" },
  viewer: { english: "viewer", french: "observateur", arabic: "مشاهد" },
};

const providerLabels: Record<GitProviderOption, MessageValue> = {
  none: { english: "none", french: "aucun", arabic: "بدون" },
  github: { english: "github", french: "github", arabic: "github" },
  gitlab: { english: "gitlab", french: "gitlab", arabic: "gitlab" },
  bitbucket: { english: "bitbucket", french: "bitbucket", arabic: "bitbucket" },
};

export const t = (language: LanguagePreference, key: string, replacements?: Record<string, string>) => {
  const template = messages[key]?.[language] ?? messages[key]?.english ?? key;
  if (!replacements) return template;

  return Object.entries(replacements).reduce(
    (current, [name, value]) => current.replace(new RegExp(`\\{${name}\\}`, "g"), value),
    template
  );
};

export const roleLabel = (language: LanguagePreference, role: MemberRole) =>
  roleLabels[role]?.[language] ?? role;

export const providerLabel = (language: LanguagePreference, provider: GitProviderOption) =>
  providerLabels[provider]?.[language] ?? provider;

export const localeFromLanguage = (language: LanguagePreference) => {
  if (language === "french") return "fr-FR";
  if (language === "arabic") return "ar";
  return "en-US";
};

messages["nav.overview"] = {
  english: "Overview",
  french: "Vue d'ensemble",
  arabic: "نظرة عامة",
};
messages["nav.projects"] = {
  english: "Projects",
  french: "Projets",
  arabic: "المشاريع",
};
messages["nav.hosts"] = {
  english: "Hosts",
  french: "Hotes",
  arabic: "المضيفون",
};
messages["nav.pipelines"] = {
  english: "Pipelines",
  french: "Pipelines",
  arabic: "خطوط الانابيب",
};
messages["nav.deployments"] = {
  english: "Deployments",
  french: "Deployements",
  arabic: "عمليات النشر",
};
messages["nav.alerts"] = {
  english: "Alerts",
  french: "Alertes",
  arabic: "التنبيهات",
};
messages["nav.settings"] = {
  english: "Settings",
  french: "Parametres",
  arabic: "الاعدادات",
};
messages["navbar.dashboard"] = {
  english: "Dashboard",
  french: "Tableau de bord",
  arabic: "لوحة التحكم",
};
messages["navbar.logout"] = {
  english: "Logout",
  french: "Deconnexion",
  arabic: "تسجيل الخروج",
};
messages["greeting.welcomeBack"] = {
  english: "Welcome back, {name}",
  french: "Bon retour, {name}",
  arabic: "مرحبا بعودتك، {name}",
};
messages["greeting.user"] = {
  english: "User",
  french: "Utilisateur",
  arabic: "مستخدم",
};
messages["quickActions.newProject"] = {
  english: "New Project",
  french: "Nouveau projet",
  arabic: "مشروع جديد",
};
messages["quickActions.triggerDeploy"] = {
  english: "Trigger Deploy",
  french: "Lancer un deploiement",
  arabic: "تشغيل نشر",
};
messages["quickActions.addHost"] = {
  english: "Add Host",
  french: "Ajouter un hote",
  arabic: "اضافة مضيف",
};
messages["stats.totalProjects"] = {
  english: "Total Projects",
  french: "Total des projets",
  arabic: "اجمالي المشاريع",
};
messages["stats.runningProjects"] = {
  english: "Running Projects",
  french: "Projets actifs",
  arabic: "المشاريع النشطة",
};
messages["stats.healthyProjects"] = {
  english: "Healthy Projects",
  french: "Projets sains",
  arabic: "المشاريع السليمة",
};
messages["stats.openAlerts"] = {
  english: "Open Alerts",
  french: "Alertes ouvertes",
  arabic: "التنبيهات المفتوحة",
};
messages["pipelines.recent"] = {
  english: "Recent Pipelines",
  french: "Pipelines recentes",
  arabic: "اخر خطوط الانابيب",
};
messages["pipelines.status"] = {
  english: "Status",
  french: "Statut",
  arabic: "الحالة",
};
messages["pipelines.project"] = {
  english: "Project",
  french: "Projet",
  arabic: "المشروع",
};
messages["pipelines.branch"] = {
  english: "Branch",
  french: "Branche",
  arabic: "الفرع",
};
messages["pipelines.duration"] = {
  english: "Duration",
  french: "Duree",
  arabic: "المدة",
};
messages["pipelines.trigger"] = {
  english: "Trigger",
  french: "Declencheur",
  arabic: "المشغل",
};
messages["pipelines.started"] = {
  english: "Started",
  french: "Demarre",
  arabic: "وقت البدء",
};
messages["pipelines.none"] = {
  english: "No pipeline runs yet.",
  french: "Aucune execution de pipeline pour le moment.",
  arabic: "لا توجد عمليات pipeline حتى الان.",
};
messages["health.title"] = {
  english: "Service Health",
  french: "Sante des services",
  arabic: "صحة الخدمات",
};
messages["health.none"] = {
  english: "No services available yet.",
  french: "Aucun service disponible pour le moment.",
  arabic: "لا توجد خدمات متاحة حتى الان.",
};
messages["activity.title"] = {
  english: "Deploy Activity",
  french: "Activite de deploiement",
  arabic: "نشاط النشر",
};
messages["activity.none"] = {
  english: "No deployment activity yet.",
  french: "Aucune activite de deploiement pour le moment.",
  arabic: "لا يوجد نشاط نشر حتى الان.",
};
messages["alerts.title"] = {
  english: "Alerts",
  french: "Alertes",
  arabic: "التنبيهات",
};
messages["alerts.none"] = {
  english: "No alerts yet.",
  french: "Aucune alerte pour le moment.",
  arabic: "لا توجد تنبيهات حتى الان.",
};
messages["alerts.pageTitle"] = {
  english: "Alerts",
  french: "Alertes",
  arabic: "التنبيهات",
};
messages["alerts.pageSubtitle"] = {
  english: "Review triggered alerts, acknowledge incidents, and tune notification thresholds.",
  french: "Consultez les alertes declenchees, acquittez les incidents et ajustez les seuils de notification.",
  arabic: "راجع التنبيهات المفعلة واقر بالحوادث واضبط حدود الاشعارات.",
};
messages["alerts.loading"] = {
  english: "Loading alerts...",
  french: "Chargement des alertes...",
  arabic: "جار تحميل التنبيهات...",
};
messages["alerts.tableTitle"] = {
  english: "Alerts",
  french: "Alertes",
  arabic: "التنبيهات",
};
messages["alerts.severity"] = {
  english: "Severity",
  french: "Gravite",
  arabic: "الحدة",
};
messages["alerts.project"] = {
  english: "Project",
  french: "Projet",
  arabic: "المشروع",
};
messages["alerts.rule"] = {
  english: "Rule",
  french: "Regle",
  arabic: "القاعدة",
};
messages["alerts.message"] = {
  english: "Message",
  french: "Message",
  arabic: "الرسالة",
};
messages["alerts.timestamp"] = {
  english: "Timestamp",
  french: "Horodatage",
  arabic: "الوقت",
};
messages["alerts.status"] = {
  english: "Status",
  french: "Statut",
  arabic: "الحالة",
};
messages["alerts.filterSearch"] = {
  english: "Search alerts...",
  french: "Rechercher des alertes...",
  arabic: "ابحث في التنبيهات...",
};
messages["alerts.allSeverities"] = {
  english: "All Severities",
  french: "Toutes les gravites",
  arabic: "كل درجات الحدة",
};
messages["alerts.allProjects"] = {
  english: "All Projects",
  french: "Tous les projets",
  arabic: "كل المشاريع",
};
messages["alerts.allRules"] = {
  english: "All Rules",
  french: "Toutes les regles",
  arabic: "كل القواعد",
};
messages["alerts.last24h"] = {
  english: "Last 24 hours",
  french: "Dernieres 24 heures",
  arabic: "اخر 24 ساعة",
};
messages["alerts.last7d"] = {
  english: "Last 7 days",
  french: "Derniers 7 jours",
  arabic: "اخر 7 ايام",
};
messages["alerts.last30d"] = {
  english: "Last 30 days",
  french: "Derniers 30 jours",
  arabic: "اخر 30 يوما",
};
messages["alerts.rulesTitle"] = {
  english: "Alert Rules",
  french: "Regles d'alerte",
  arabic: "قواعد التنبيه",
};
messages["alerts.detailTitle"] = {
  english: "Alert Detail",
  french: "Detail de l'alerte",
  arabic: "تفاصيل التنبيه",
};
messages["alerts.metricAtTrigger"] = {
  english: "Metric At Trigger",
  french: "Metrique au declenchement",
  arabic: "المقياس عند التفعيل",
};
messages["alerts.notificationTest"] = {
  english: "Test Notification",
  french: "Tester la notification",
  arabic: "اختبار الاشعار",
};
messages["alerts.notificationSending"] = {
  english: "Sending...",
  french: "Envoi...",
  arabic: "جار الارسال...",
};
messages["alerts.notificationSentAt"] = {
  english: "Notification test sent at {time}",
  french: "Notification de test envoyee a {time}",
  arabic: "تم ارسال اشعار اختبار في {time}",
};
messages["alerts.acknowledge"] = {
  english: "Acknowledge",
  french: "Acquitter",
  arabic: "اقرار",
};
messages["alerts.statusPrefix"] = {
  english: "Status: {status}",
  french: "Statut : {status}",
  arabic: "الحالة: {status}",
};
messages["hosts.pageTitle"] = {
  english: "Hosts",
  french: "Hotes",
  arabic: "المضيفون",
};
messages["hosts.pageSubtitle"] = {
  english: "Manage deployment nodes, inspect capacity, and verify SSH connectivity.",
  french: "Gerez les noeuds de deploiement, inspectez la capacite et verifiez la connectivite SSH.",
  arabic: "ادارة عقد النشر وفحص السعة والتحقق من اتصال SSH.",
};
messages["hosts.loading"] = {
  english: "Loading hosts...",
  french: "Chargement des hotes...",
  arabic: "جار تحميل المضيفين...",
};
messages["hosts.empty"] = {
  english: "No hosts yet. Add your first deployment host.",
  french: "Aucun hote pour le moment. Ajoutez votre premier hote de deploiement.",
  arabic: "لا يوجد مضيفون بعد. اضف اول مضيف نشر.",
};
messages["hosts.add"] = {
  english: "Add Host",
  french: "Ajouter un hote",
  arabic: "اضافة مضيف",
};
messages["hosts.addModalTitle"] = {
  english: "Add Host",
  french: "Ajouter un hote",
  arabic: "اضافة مضيف",
};
messages["hosts.addModalSubtitle"] = {
  english: "Register a deployment host and verify SSH access.",
  french: "Enregistrez un hote de deploiement et verifiez l'acces SSH.",
  arabic: "سجل مضيف نشر وتحقق من وصول SSH.",
};
messages["hosts.hostName"] = {
  english: "Host name",
  french: "Nom d'hote",
  arabic: "اسم المضيف",
};
messages["hosts.ipAddress"] = {
  english: "IP address",
  french: "Adresse IP",
  arabic: "عنوان IP",
};
messages["hosts.sshUser"] = {
  english: "SSH user",
  french: "Utilisateur SSH",
  arabic: "مستخدم SSH",
};
messages["hosts.sshKey"] = {
  english: "SSH private key",
  french: "Cle privee SSH",
  arabic: "مفتاح SSH الخاص",
};
messages["hosts.testOutput"] = {
  english: "Test output",
  french: "Resultat du test",
  arabic: "مخرجات الاختبار",
};
messages["hosts.noTestYet"] = {
  english: "No SSH test run yet.",
  french: "Aucun test SSH execute pour le moment.",
  arabic: "لم يتم تشغيل اختبار SSH بعد.",
};
messages["hosts.testingSsh"] = {
  english: "Testing SSH connectivity...",
  french: "Test de connectivite SSH...",
  arabic: "جار اختبار اتصال SSH...",
};
messages["hosts.testFailed"] = {
  english: "SSH test failed",
  french: "Echec du test SSH",
  arabic: "فشل اختبار SSH",
};
messages["hosts.saveFailed"] = {
  english: "Failed to save host",
  french: "Echec de l'enregistrement de l'hote",
  arabic: "فشل حفظ المضيف",
};
messages["hosts.testConnection"] = {
  english: "Test Connection",
  french: "Tester la connexion",
  arabic: "اختبار الاتصال",
};
messages["hosts.testing"] = {
  english: "Testing...",
  french: "Test en cours...",
  arabic: "جار الاختبار...",
};
messages["hosts.cancel"] = {
  english: "Cancel",
  french: "Annuler",
  arabic: "الغاء",
};
messages["hosts.saveHost"] = {
  english: "Save Host",
  french: "Enregistrer l'hote",
  arabic: "حفظ المضيف",
};
messages["hosts.adding"] = {
  english: "Adding...",
  french: "Ajout...",
  arabic: "جار الاضافة...",
};
messages["hosts.removeHost"] = {
  english: "Remove Host",
  french: "Supprimer l'hote",
  arabic: "حذف المضيف",
};
messages["hosts.removing"] = {
  english: "Removing...",
  french: "Suppression...",
  arabic: "جار الحذف...",
};
messages["hosts.listTitle"] = {
  english: "Hosts",
  french: "Hotes",
  arabic: "المضيفون",
};
messages["hosts.hostname"] = {
  english: "Hostname",
  french: "Nom d'hote",
  arabic: "اسم المضيف",
};
messages["hosts.ip"] = {
  english: "IP",
  french: "IP",
  arabic: "IP",
};
messages["hosts.status"] = {
  english: "Status",
  french: "Statut",
  arabic: "الحالة",
};
messages["hosts.cpu"] = {
  english: "CPU",
  french: "CPU",
  arabic: "المعالج",
};
messages["hosts.memory"] = {
  english: "Memory",
  french: "Memoire",
  arabic: "الذاكرة",
};
messages["hosts.disk"] = {
  english: "Disk",
  french: "Disque",
  arabic: "القرص",
};
messages["hosts.deployedContainers"] = {
  english: "Deployed Containers",
  french: "Conteneurs deployes",
  arabic: "الحاويات المنشورة",
};
messages["hosts.activeDeployments"] = {
  english: "Active Deployments",
  french: "Deploiements actifs",
  arabic: "عمليات النشر النشطة",
};
messages["hosts.removeBlocked"] = {
  english: "Removal is blocked while {count} active deployment{suffix} assigned to this host.",
  french: "La suppression est bloquee tant que {count} deploiement{suffix} actif est assigne a cet hote.",
  arabic: "تتعذر الازالة طالما ان هناك {count} عملية نشر نشطة مسندة الى هذا المضيف.",
};
messages["projects.pageTitle"] = {
  english: "Projects",
  french: "Projets",
  arabic: "المشاريع",
};
messages["projects.create"] = {
  english: "Create Project",
  french: "Creer un projet",
  arabic: "انشاء مشروع",
};
messages["projects.search"] = {
  english: "Search projects...",
  french: "Rechercher des projets...",
  arabic: "ابحث في المشاريع...",
};
messages["projects.none"] = {
  english: "No projects found.",
  french: "Aucun projet trouve.",
  arabic: "لم يتم العثور على مشاريع.",
};
messages["projects.never"] = {
  english: "Never",
  french: "Jamais",
  arabic: "ابدا",
};
messages["projectDetail.loading"] = {
  english: "Loading project data...",
  french: "Chargement des donnees du projet...",
  arabic: "جار تحميل بيانات المشروع...",
};
messages["projectDetail.unavailable"] = {
  english: "Project unavailable",
  french: "Projet indisponible",
  arabic: "المشروع غير متاح",
};
messages["projectDetail.failedLoadRuns"] = {
  english: "Failed to load pipeline runs",
  french: "Echec du chargement des executions pipeline",
  arabic: "فشل تحميل عمليات تشغيل pipeline",
};
messages["projectDetail.failedTrigger"] = {
  english: "Failed to trigger pipeline",
  french: "Echec du declenchement du pipeline",
  arabic: "فشل تشغيل pipeline",
};
messages["projectDetail.failedCancel"] = {
  english: "Failed to cancel pipeline run",
  french: "Echec de l'annulation de l'execution pipeline",
  arabic: "فشل الغاء تشغيل pipeline",
};
messages["projectDetail.runsCount"] = {
  english: "{count} run{suffix}",
  french: "{count} execution{suffix}",
  arabic: "{count} تشغيل",
};
messages["projectDetail.loadingRuns"] = {
  english: "Loading pipeline runs...",
  french: "Chargement des executions pipeline...",
  arabic: "جار تحميل عمليات pipeline...",
};
messages["projectDetail.uptime30d"] = {
  english: "30-Day Uptime",
  french: "Disponibilite sur 30 jours",
  arabic: "نسبة التوفر خلال 30 يوما",
};
messages["projectDetail.logsShowing"] = {
  english: "Showing {shown} of {total} entries",
  french: "Affichage de {shown} sur {total} entrees",
  arabic: "عرض {shown} من اصل {total} سجل",
};
messages["projectDetail.liveStreamActive"] = {
  english: "Live stream active",
  french: "Flux direct actif",
  arabic: "البث المباشر نشط",
};
messages["projectDetail.autoScroll"] = {
  english: "Auto-scroll",
  french: "Defilement auto",
  arabic: "تمرير تلقائي",
};
messages["projectDetail.defaultEnv"] = {
  english: "default",
  french: "defaut",
  arabic: "افتراضي",
};
messages["projectHeader.lastDeploy"] = {
  english: "Last deploy: {value}",
  french: "Dernier deploiement : {value}",
  arabic: "اخر نشر: {value}",
};
messages["projectHeader.neverDeployed"] = {
  english: "Never deployed",
  french: "Jamais deployee",
  arabic: "لم يتم النشر ابدا",
};
messages["projectDetail.image"] = {
  english: "Image:",
  french: "Image :",
  arabic: "الصورة:",
};
messages["projectDetail.domain"] = {
  english: "Domain:",
  french: "Domaine :",
  arabic: "النطاق:",
};
messages["projectDetail.replicas"] = {
  english: "Replicas:",
  french: "Replicas :",
  arabic: "النسخ:",
};
messages["projectDetail.strategy"] = {
  english: "Strategy:",
  french: "Strategie :",
  arabic: "الاستراتيجية:",
};
messages["projectDetail.deployTo"] = {
  english: "Deploy to {env}",
  french: "Deployer vers {env}",
  arabic: "نشر الى {env}",
};
messages["projectDetail.deploying"] = {
  english: "Deploying...",
  french: "Deploiement...",
  arabic: "جار النشر...",
};
messages["projectDetail.rollback"] = {
  english: "Rollback",
  french: "Retour arriere",
  arabic: "تراجع",
};
messages["projectDetail.rollingBack"] = {
  english: "Rolling back...",
  french: "Retour arriere...",
  arabic: "جار التراجع...",
};
messages["projectDetail.confirmRollback"] = {
  english: "Confirm Rollback?",
  french: "Confirmer le retour arriere ?",
  arabic: "تأكيد التراجع؟",
};
messages["projectDetail.recentDeployments"] = {
  english: "Recent Deployments",
  french: "Deploiements recents",
  arabic: "اخر عمليات النشر",
};
messages["projectDetail.triggeredBy"] = {
  english: "Triggered by",
  french: "Declenche par",
  arabic: "تم التشغيل بواسطة",
};
messages["projectDetail.noDeployments"] = {
  english: "No deployments yet.",
  french: "Aucun deploiement pour le moment.",
  arabic: "لا توجد عمليات نشر حتى الان.",
};
messages["projectDetail.secrets"] = {
  english: "Secrets & Environment Variables",
  french: "Secrets et variables d'environnement",
  arabic: "الاسرار ومتغيرات البيئة",
};
messages["projectDetail.add"] = {
  english: "Add",
  french: "Ajouter",
  arabic: "اضافة",
};
messages["projectDetail.noSecrets"] = {
  english: "No secrets configured.",
  french: "Aucun secret configure.",
  arabic: "لا توجد اسرار معدة.",
};
messages["projectDetail.readOnly"] = {
  english: "Read-only",
  french: "Lecture seule",
  arabic: "للقراءة فقط",
};
messages["projectDetail.editable"] = {
  english: "Editable",
  french: "Modifiable",
  arabic: "قابل للتعديل",
};
messages["projects.errorLoad"] = {
  english: "Failed to load project data",
  french: "Echec du chargement des donnees du projet",
  arabic: "فشل تحميل بيانات المشروع",
};
messages["projects.trigger"] = {
  english: "Trigger",
  french: "Declencheur",
  arabic: "المشغل",
};
messages["table.date"] = {
  english: "Date",
  french: "Date",
  arabic: "التاريخ",
};
messages["pipelines.commit"] = {
  english: "Commit",
  french: "Commit",
  arabic: "الالتزام",
};
messages["filters.custom"] = {
  english: "Custom",
  french: "Personnalise",
  arabic: "مخصص",
};
messages["actions.cancel"] = {
  english: "Cancel",
  french: "Annuler",
  arabic: "الغاء",
};
messages["actions.edit"] = {
  english: "Edit",
  french: "Modifier",
  arabic: "تعديل",
};
messages["actions.delete"] = {
  english: "Delete",
  french: "Supprimer",
  arabic: "حذف",
};
messages["actions.show"] = {
  english: "Show",
  french: "Afficher",
  arabic: "اظهار",
};
messages["actions.hide"] = {
  english: "Hide",
  french: "Masquer",
  arabic: "اخفاء",
};
messages["actions.yes"] = {
  english: "Yes",
  french: "Oui",
  arabic: "نعم",
};
messages["table.value"] = {
  english: "Value",
  french: "Valeur",
  arabic: "القيمة",
};
messages["pipeline.trigger"] = {
  english: "Trigger Pipeline",
  french: "Declencher le pipeline",
  arabic: "تشغيل pipeline",
};
messages["pipeline.triggering"] = {
  english: "Triggering...",
  french: "Declenchement...",
  arabic: "جار التشغيل...",
};
messages["pipeline.runs"] = {
  english: "Pipeline Runs",
  french: "Executions pipeline",
  arabic: "عمليات تشغيل pipeline",
};
messages["pipeline.runId"] = {
  english: "Run ID",
  french: "ID execution",
  arabic: "معرف التشغيل",
};
messages["pipeline.started"] = {
  english: "Started",
  french: "Demarre",
  arabic: "بدا",
};
messages["pipeline.none"] = {
  english: "No pipeline runs yet.",
  french: "Aucune execution pipeline pour le moment.",
  arabic: "لا توجد عمليات pipeline حتى الان.",
};
messages["pipeline.cancelRun"] = {
  english: "Cancel Run",
  french: "Annuler l'execution",
  arabic: "الغاء التشغيل",
};
messages["pipeline.cancelling"] = {
  english: "Cancelling...",
  french: "Annulation...",
  arabic: "جار الالغاء...",
};
messages["pipeline.retryFailed"] = {
  english: "Retry from Failed Stage",
  french: "Relancer depuis l'etape en echec",
  arabic: "اعادة المحاولة من المرحلة الفاشلة",
};
messages["pipeline.retrying"] = {
  english: "Retrying...",
  french: "Nouvelle tentative...",
  arabic: "جار اعادة المحاولة...",
};
messages["pipeline.stageLogs"] = {
  english: "Stage Logs",
  french: "Journaux des etapes",
  arabic: "سجلات المراحل",
};
messages["pipeline.stream.idle"] = {
  english: "Idle",
  french: "Inactif",
  arabic: "خامل",
};
messages["pipeline.stream.connecting"] = {
  english: "Connecting",
  french: "Connexion",
  arabic: "جار الاتصال",
};
messages["pipeline.stream.live"] = {
  english: "Live",
  french: "Actif",
  arabic: "مباشر",
};
messages["pipeline.stream.reconnecting"] = {
  english: "Reconnecting",
  french: "Reconnexion",
  arabic: "اعادة الاتصال",
};
messages["pipeline.stream.offline"] = {
  english: "Offline",
  french: "Hors ligne",
  arabic: "غير متصل",
};
messages["pipeline.stageDuration"] = {
  english: "Stage Duration",
  french: "Duree des etapes",
  arabic: "مدة المراحل",
};
messages["pipeline.selectStage"] = {
  english: "Select a stage above to view its logs.",
  french: "Selectionnez une etape ci-dessus pour voir ses journaux.",
  arabic: "اختر مرحلة اعلاه لعرض سجلاتها.",
};
messages["pipeline.noStageLogs"] = {
  english: "No logs available for this stage.",
  french: "Aucun journal disponible pour cette etape.",
  arabic: "لا توجد سجلات متاحة لهذه المرحلة.",
};
messages["pipeline.stage"] = {
  english: "stage",
  french: "etape",
  arabic: "مرحلة",
};
messages["monitoring.alertHistory"] = {
  english: "Alert History",
  french: "Historique des alertes",
  arabic: "سجل التنبيهات",
};
messages["monitoring.triggered"] = {
  english: "Triggered",
  french: "Declenche",
  arabic: "وقت التفعيل",
};
messages["monitoring.resolved"] = {
  english: "Resolved",
  french: "Resolue",
  arabic: "تم الحل",
};
messages["monitoring.ongoing"] = {
  english: "Ongoing",
  french: "En cours",
  arabic: "مستمر",
};
messages["monitoring.noAlertsRange"] = {
  english: "No alerts in this time range.",
  french: "Aucune alerte sur cette periode.",
  arabic: "لا توجد تنبيهات ضمن هذا النطاق الزمني.",
};
messages["monitoring.serviceStatus"] = {
  english: "Service Status",
  french: "Statut du service",
  arabic: "حالة الخدمة",
};
messages["monitoring.lastCheck"] = {
  english: "Last check",
  french: "Derniere verification",
  arabic: "اخر فحص",
};
messages["monitoring.cpu"] = {
  english: "CPU",
  french: "CPU",
  arabic: "المعالج",
};
messages["monitoring.memory"] = {
  english: "Memory",
  french: "Memoire",
  arabic: "الذاكرة",
};
messages["monitoring.latency"] = {
  english: "Latency",
  french: "Latence",
  arabic: "زمن الاستجابة",
};
messages["monitoring.uptime"] = {
  english: "Uptime",
  french: "Disponibilite",
  arabic: "التوفر",
};
messages["monitoring.cpuUsage"] = {
  english: "CPU Usage (%)",
  french: "Utilisation CPU (%)",
  arabic: "استخدام المعالج (%)",
};
messages["monitoring.memoryUsage"] = {
  english: "Memory Usage (MB)",
  french: "Utilisation memoire (Mo)",
  arabic: "استخدام الذاكرة (MB)",
};
messages["monitoring.networkIo"] = {
  english: "Network I/O (KB/s)",
  french: "Entree/sortie reseau (KB/s)",
  arabic: "ادخال/اخراج الشبكة (KB/s)",
};
messages["monitoring.responseLatency"] = {
  english: "Response Latency (ms)",
  french: "Latence de reponse (ms)",
  arabic: "زمن استجابة الطلب (ms)",
};
messages["monitoring.noCpuMetrics"] = {
  english: "No CPU metrics available yet.",
  french: "Aucune metrique CPU disponible pour le moment.",
  arabic: "لا توجد مقاييس CPU متاحة حاليا.",
};
messages["monitoring.noMemoryMetrics"] = {
  english: "No memory metrics available yet.",
  french: "Aucune metrique memoire disponible pour le moment.",
  arabic: "لا توجد مقاييس ذاكرة متاحة حاليا.",
};
messages["monitoring.noNetworkMetrics"] = {
  english: "No network metrics available yet.",
  french: "Aucune metrique reseau disponible pour le moment.",
  arabic: "لا توجد مقاييس شبكة متاحة حاليا.",
};
messages["monitoring.noLatencyMetrics"] = {
  english: "No latency metrics available yet.",
  french: "Aucune metrique de latence disponible pour le moment.",
  arabic: "لا توجد مقاييس زمن استجابة متاحة حاليا.",
};
messages["monitoring.limitMb"] = {
  english: "Limit {value} MB",
  french: "Limite {value} MB",
  arabic: "الحد {value} MB",
};
messages["monitoring.inbound"] = {
  english: "Inbound",
  french: "Entrant",
  arabic: "الوارد",
};
messages["monitoring.outbound"] = {
  english: "Outbound",
  french: "Sortant",
  arabic: "الصادر",
};
messages["monitoring.uptime30d"] = {
  english: "{percent}% uptime (30d)",
  french: "{percent}% disponibilite (30j)",
  arabic: "{percent}% توفر (30 يوم)",
};
messages["monitoring.today"] = {
  english: "Today",
  french: "Aujourd'hui",
  arabic: "اليوم",
};
messages["monitoring.noUptimeHistory"] = {
  english: "No uptime history yet.",
  french: "Aucun historique de disponibilite pour le moment.",
  arabic: "لا يوجد سجل توفر حتى الان.",
};
messages["monitoring.operational"] = {
  english: "Operational",
  french: "Operationnel",
  arabic: "تشغيلي",
};
messages["monitoring.incident"] = {
  english: "Incident",
  french: "Incident",
  arabic: "حادث",
};
messages["logs.search"] = {
  english: "Search logs...",
  french: "Rechercher dans les journaux...",
  arabic: "ابحث في السجلات...",
};
messages["logs.searchRegex"] = {
  english: "Search with regex...",
  french: "Rechercher avec regex...",
  arabic: "بحث باستخدام regex...",
};
messages["logs.invalidRegex"] = {
  english: "Invalid regular expression",
  french: "Expression reguliere invalide",
  arabic: "تعبير منتظم غير صالح",
};
messages["logs.clear"] = {
  english: "Clear",
  french: "Effacer",
  arabic: "مسح",
};
messages["logs.toggleRegex"] = {
  english: "Toggle regex",
  french: "Basculer regex",
  arabic: "تبديل regex",
};
messages["logs.allContainers"] = {
  english: "All Containers",
  french: "Tous les conteneurs",
  arabic: "كل الحاويات",
};
messages["logs.live"] = {
  english: "Live",
  french: "مباشر",
  arabic: "مباشر",
};
messages["logs.historical"] = {
  english: "Historical",
  french: "Historique",
  arabic: "سجل",
};
messages["logs.export"] = {
  english: "Export",
  french: "Exporter",
  arabic: "تصدير",
};
messages["logs.exportJson"] = {
  english: "Export as JSON",
  french: "Exporter en JSON",
  arabic: "تصدير كـ JSON",
};
messages["logs.exportText"] = {
  english: "Export as Plain Text",
  french: "Exporter en texte brut",
  arabic: "تصدير كنص عادي",
};
messages["logs.tableTitle"] = {
  english: "Log Table",
  french: "Table des journaux",
  arabic: "جدول السجلات",
};
messages["logs.timestamp"] = {
  english: "Timestamp",
  french: "Horodatage",
  arabic: "الوقت",
};
messages["logs.level"] = {
  english: "Level",
  french: "Niveau",
  arabic: "المستوى",
};
messages["logs.container"] = {
  english: "Container",
  french: "Conteneur",
  arabic: "الحاوية",
};
messages["logs.message"] = {
  english: "Message",
  french: "Message",
  arabic: "الرسالة",
};
messages["logs.noEntries"] = {
  english: "No log entries match the current filters.",
  french: "Aucune entree ne correspond aux filtres actuels.",
  arabic: "لا توجد سجلات تطابق الفلاتر الحالية.",
};

const pipelineRunStatusLabels: Record<"queued" | "running" | "success" | "failed", MessageValue> = {
  queued: { english: "Queued", french: "En file", arabic: "في الانتظار" },
  running: { english: "Running", french: "En cours", arabic: "قيد التشغيل" },
  success: { english: "Success", french: "Succes", arabic: "نجاح" },
  failed: { english: "Failed", french: "Echec", arabic: "فشل" },
};

const serviceStatusLabels: Record<"healthy" | "degraded" | "down", MessageValue> = {
  healthy: { english: "Healthy", french: "Sain", arabic: "سليم" },
  degraded: { english: "Degraded", french: "Degrade", arabic: "متدهور" },
  down: { english: "Down", french: "Indisponible", arabic: "متوقف" },
};

const logLevelLabels: Record<"debug" | "info" | "warn" | "error" | "fatal", MessageValue> = {
  debug: { english: "Debug", french: "Debug", arabic: "تصحيح" },
  info: { english: "Info", french: "Info", arabic: "معلومة" },
  warn: { english: "Warn", french: "Alerte", arabic: "تحذير" },
  error: { english: "Error", french: "Erreur", arabic: "خطأ" },
  fatal: { english: "Fatal", french: "Fatal", arabic: "كارثي" },
};

export const pipelineRunStatusLabel = (language: LanguagePreference, status: "queued" | "running" | "success" | "failed") =>
  pipelineRunStatusLabels[status]?.[language] ?? status;

export const serviceStatusLabel = (language: LanguagePreference, status: "healthy" | "degraded" | "down") =>
  serviceStatusLabels[status]?.[language] ?? status;

export const logLevelLabel = (language: LanguagePreference, level: "debug" | "info" | "warn" | "error" | "fatal") =>
  logLevelLabels[level]?.[language] ?? level;
messages["projects.all"] = {
  english: "All",
  french: "Tous",
  arabic: "الكل",
};
messages["projects.modalTitle"] = {
  english: "Create Project",
  french: "Creer un projet",
  arabic: "انشاء مشروع",
};
messages["projects.projectName"] = {
  english: "Project Name",
  french: "Nom du projet",
  arabic: "اسم المشروع",
};
messages["projects.repoUrl"] = {
  english: "Repository URL",
  french: "URL du depot",
  arabic: "رابط المستودع",
};
messages["projects.branch"] = {
  english: "Branch",
  french: "Branche",
  arabic: "الفرع",
};
messages["projects.envSetup"] = {
  english: "Environment Setup",
  french: "Configuration d'environnement",
  arabic: "اعداد البيئة",
};
messages["projects.creating"] = {
  english: "Creating...",
  french: "Creation...",
  arabic: "جار الانشاء...",
};
messages["projects.nameRepoRequired"] = {
  english: "Name and repository URL are required.",
  french: "Le nom et l'URL du depot sont requis.",
  arabic: "اسم المشروع ورابط المستودع مطلوبان.",
};
messages["projects.createFailed"] = {
  english: "Failed to create project",
  french: "Echec de la creation du projet",
  arabic: "فشل انشاء المشروع",
};
messages["deployments.pageTitle"] = {
  english: "Deployments",
  french: "Deploiements",
  arabic: "عمليات النشر",
};
messages["deployments.subtitle"] = {
  english: "Monitor deployment throughput and release health.",
  french: "Surveillez le debit des deploiements et la sante des livraisons.",
  arabic: "راقب معدل عمليات النشر وصحة الاصدارات.",
};
messages["deployments.successful"] = {
  english: "Successful",
  french: "Reussis",
  arabic: "ناجح",
};
messages["deployments.failed"] = {
  english: "Failed",
  french: "Echoues",
  arabic: "فاشل",
};
messages["deployments.inProgress"] = {
  english: "In Progress",
  french: "En cours",
  arabic: "قيد التنفيذ",
};
messages["pipelines.pageTitle"] = {
  english: "Pipelines",
  french: "Pipelines",
  arabic: "خطوط الانابيب",
};
messages["pipelines.pageSubtitle"] = {
  english: "Track recent pipeline runs across your projects.",
  french: "Suivez les executions recentes de pipeline sur vos projets.",
  arabic: "تتبع اخر عمليات تشغيل خطوط الانابيب عبر مشاريعك.",
};

const alertSeverityLabels: Record<"critical" | "warning" | "info", MessageValue> = {
  critical: { english: "critical", french: "critique", arabic: "حرج" },
  warning: { english: "warning", french: "avertissement", arabic: "تحذير" },
  info: { english: "info", french: "info", arabic: "معلومة" },
};

const alertRuleLabels: Record<string, MessageValue> = {
  cpu: { english: "CPU", french: "CPU", arabic: "المعالج" },
  memory: { english: "memory", french: "memoire", arabic: "الذاكرة" },
  latency: { english: "latency", french: "latence", arabic: "الكمون" },
  availability: { english: "availability", french: "disponibilite", arabic: "التوفر" },
  deployment: { english: "deployment", french: "deploiement", arabic: "نشر" },
  disk: { english: "disk", french: "disque", arabic: "القرص" },
  certificate: { english: "certificate", french: "certificat", arabic: "الشهادة" },
};

const projectStatusLabels: Record<"running" | "stopped" | "failed", MessageValue> = {
  running: { english: "Running", french: "Actif", arabic: "يعمل" },
  stopped: { english: "Stopped", french: "Arrete", arabic: "متوقف" },
  failed: { english: "Failed", french: "Echec", arabic: "فشل" },
};

const hostStatusLabels: Record<"online" | "offline", MessageValue> = {
  online: { english: "online", french: "en ligne", arabic: "متصل" },
  offline: { english: "offline", french: "hors ligne", arabic: "غير متصل" },
};

export const alertSeverityLabel = (language: LanguagePreference, severity: "critical" | "warning" | "info") =>
  alertSeverityLabels[severity]?.[language] ?? severity;

export const alertRuleLabel = (language: LanguagePreference, rule: string) =>
  alertRuleLabels[rule]?.[language] ?? rule;

export const projectStatusLabel = (language: LanguagePreference, status: "running" | "stopped" | "failed") =>
  projectStatusLabels[status]?.[language] ?? status;

export const hostStatusLabel = (language: LanguagePreference, status: "online" | "offline") =>
  hostStatusLabels[status]?.[language] ?? status;
