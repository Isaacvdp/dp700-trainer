// Domain 1: Implement and manage an analytics solution
DP700.questions.push(
// ---------- Workspace settings ----------
{
  id: 'd1-01', s: 'ws', type: 'single',
  stem: "Data engineers in a workspace use a custom Spark pool. They complain that the first notebook session each morning takes several minutes to start. They want sessions for ad-hoc exploration to start within seconds, and they do not need custom libraries. What should you do?",
  options: [
    "Set the workspace default pool to the **starter pool**",
    "Increase the maximum number of nodes in the custom pool",
    "Enable autoscale on the custom pool",
    "Attach an environment that preinstalls the common libraries",
  ],
  answer: 0,
  explain: "**Starter pools** are prehydrated clusters that Fabric keeps warm, so sessions usually start in seconds. Custom pools are created on demand and typically take a few minutes to start.\n\nMore nodes or autoscale don't change the start time. Installing libraries through an environment actually **adds** start-up time.",
  refs: [{ t: 'Starter pools', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/configure-starter-pools' }, { t: 'Spark compute', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/spark-compute' }]
},
{
  id: 'd1-02', s: 'ws', type: 'statements',
  stem: "You are reviewing the Spark settings of a Fabric workspace.",
  statements: [
    { text: "When high concurrency mode for notebooks is on, several notebooks from the same user can share one Spark session.", answer: true },
    { text: "Libraries installed with `%pip install` inside a notebook session become available to every other notebook in the workspace.", answer: false },
    { text: "You can set an environment as the workspace default so that notebooks and Spark job definitions use its libraries and Spark properties.", answer: true },
  ],
  explain: "High concurrency mode lets several notebooks share a session, which skips the session start for each one. Inline `%pip install` affects only the current session. To share libraries across the workspace, publish them in an **environment** and set that environment as the workspace default in the Spark settings.",
  refs: [{ t: 'High concurrency mode', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/high-concurrency-overview' }, { t: 'Workspace Spark settings', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/workspace-admin-settings' }]
},
{
  id: 'd1-03', s: 'ws', type: 'single',
  stem: "All notebooks in a workspace must use the same set of custom Python wheels and the Spark property `spark.sql.shuffle.partitions = 64` by default. Developers must not have to add code to each notebook. What should you do?",
  options: [
    "Create an environment with the wheels and the Spark property, publish it, and set it as the workspace default environment",
    "Add `%pip install` and `spark.conf.set` cells to a shared notebook and call it with `%run` from every notebook",
    "Create a custom Spark pool with more memory",
    "Upload the wheels to the Files section of a lakehouse",
  ],
  answer: 0,
  explain: "An **environment** packages libraries, Spark properties and compute settings. Setting it as the workspace default (Workspace settings > Data Engineering/Science > Spark settings) applies it to every notebook and Spark job definition with no code changes.\n\nA shared `%run` cell still needs a line in every notebook. A custom pool doesn't carry libraries or properties. Uploading wheels to a lakehouse doesn't install them.",
  refs: [{ t: 'Create and use environments', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/create-and-use-environment' }]
},
{
  id: 'd1-04', s: 'ws', type: 'statements',
  stem: "A Fabric administrator created a domain named Finance. You need to assign workspaces to it.",
  statements: [
    { text: "A domain admin of Finance can assign workspaces to the Finance domain.", answer: true },
    { text: "A domain contributor who is also a workspace admin can assign that workspace to the Finance domain.", answer: true },
    { text: "Any workspace Member can assign the workspace to the Finance domain.", answer: false },
  ],
  explain: "Fabric admins and domain admins can assign any workspace to a domain. **Domain contributors** can assign only workspaces where they are workspace **admin**, and they do this from the workspace settings. A workspace Member without a domain role cannot change the domain.",
  refs: [{ t: 'Domains', u: 'https://learn.microsoft.com/en-us/fabric/governance/domains' }]
},
{
  id: 'd1-05', s: 'ws', type: 'single',
  stem: "Users report that they cannot open the files of a lakehouse in OneLake file explorer or Azure Storage Explorer. The tenant setting that allows apps outside Fabric to access OneLake is enabled. What should you check next?",
  options: [
    "The workspace OneLake setting **Users can access data stored in OneLake with apps external to Fabric**",
    "The workspace Git integration settings",
    "The high concurrency setting in the workspace Spark settings",
    "Whether the lakehouse is endorsed as Certified",
  ],
  answer: 0,
  explain: "Access from tools outside Fabric, such as OneLake file explorer, Azure Storage Explorer or ADLS APIs, is controlled at the tenant level **and** in each workspace's OneLake settings. If the workspace setting is off, external apps are blocked even when the tenant allows them.\n\nGit, Spark and endorsement settings have nothing to do with external access.",
  refs: [{ t: 'OneLake file explorer', u: 'https://learn.microsoft.com/en-us/fabric/onelake/onelake-file-explorer' }]
},
{
  id: 'd1-06', s: 'ws', type: 'single',
  stem: "A lakehouse has shortcuts to an Amazon S3 bucket. Notebooks read the same files many times a day, and the company is paying high S3 egress costs. What should you do?",
  options: [
    "Enable the **shortcut cache** in the workspace OneLake settings and set a retention period",
    "Replace the shortcuts with an S3 mirrored database",
    "Enable V-Order on the lakehouse",
    "Turn on high concurrency mode for notebooks",
  ],
  answer: 0,
  explain: "The OneLake **shortcut cache** stores files read through external shortcuts (such as S3 and Google Cloud Storage) in OneLake for a retention period you choose, so repeat reads don't go back to the source and don't incur egress.\n\nThere is no S3 mirroring for buckets. V-Order changes how Fabric writes Parquet, not how it reads from S3. High concurrency only shares Spark sessions.",
  refs: [{ t: 'Shortcut caching', u: 'https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts#caching' }]
},
{
  id: 'd1-07', s: 'ws', type: 'single',
  stem: "Your team runs Apache Airflow jobs in Fabric. Some DAGs are triggered by sensors that must be running at all times, but the Airflow environment shuts down after a period of inactivity. Which workspace setting should you change?",
  options: [
    "In the data workflow (Apache Airflow) settings, switch from the starter pool to a custom pool",
    "In the Spark settings, enable high concurrency for pipelines",
    "In the OneLake settings, enable the shortcut cache",
    "In the Git integration settings, connect the workspace to a branch",
  ],
  answer: 0,
  explain: "Apache Airflow jobs run on their own pools, configured in the workspace's data workflow settings. The **starter pool** shuts down after a period of inactivity to save cost. A **custom pool** can stay on all the time and lets you choose its size, which suits always-on sensors.\n\nThe Spark settings don't affect Airflow.",
  refs: [{ t: 'Apache Airflow job concepts', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/apache-airflow-jobs-concepts' }]
},
{
  id: 'd1-08', s: 'ws', type: 'single',
  stem: "A pipeline runs eight Notebook activities one after another. Each activity spends about 90 seconds starting a Spark session before doing a few seconds of work. You need to reduce the total run time without merging the notebooks. What should you do?",
  options: [
    "Enable **high concurrency for pipelines** in the workspace Spark settings and give the Notebook activities the same session tag",
    "Increase the pipeline timeout",
    "Set the ForEach batch count to 50",
    "Switch the workspace to a larger capacity",
  ],
  answer: 0,
  explain: "With high concurrency for pipelines, Notebook activities that share a **session tag** can reuse one Spark session instead of each starting their own. Only the first activity pays the start-up cost.\n\nA longer timeout or a larger capacity doesn't remove start-up time. These are sequential activities, not a ForEach.",
  refs: [{ t: 'High concurrency mode in pipelines', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/configure-high-concurrency-session-notebooks-in-pipelines' }]
},

// ---------- Lifecycle management ----------
{
  id: 'd1-09', s: 'lcm', type: 'order',
  stem: "You need to put an existing workspace under version control in a new, empty Azure DevOps repository. Which three actions should you perform in sequence?",
  options: [
    "Open the workspace settings and select **Git integration**",
    "Select Azure DevOps and choose the organization, project, repository, branch and folder",
    "Select **Connect and sync**, so that the workspace content is committed to the empty branch",
    "Create a deployment pipeline and assign the workspace to the Development stage",
    "Export each item as a .pbip file and push it with the Git command line",
  ],
  answer: [0, 1, 2],
  explain: "Git integration is configured per workspace by a workspace admin. Choose the provider and the repository location, then connect. When the branch is empty, the first sync commits the workspace items to it.\n\nDeployment pipelines are a separate feature. Manual exports aren't needed because Fabric serializes supported items itself.",
  refs: [{ t: 'Get started with Git integration', u: 'https://learn.microsoft.com/en-us/fabric/cicd/git-integration/git-get-started' }]
},
{
  id: 'd1-10', s: 'lcm', type: 'single',
  stem: "Two developers need to change the same notebook at the same time without overwriting each other's work. The shared development workspace is connected to the `main` branch. What should they do?",
  options: [
    "Each developer uses **Branch out to new workspace** to work in a feature branch, then merges through a pull request",
    "Both developers edit the notebook in the shared workspace and commit often",
    "One developer exports the notebook and edits the copy in a different workspace without Git",
    "Create a deployment pipeline between two development workspaces",
  ],
  answer: 0,
  explain: "**Branch out** creates a new branch and connects it to a separate workspace, giving each developer an isolated copy. Changes go back to `main` through a pull request, where conflicts are resolved.\n\nEditing the same item in one workspace causes overwrites. Unversioned copies lose history. Deployment pipelines promote content between stages; they don't merge parallel work.",
  refs: [{ t: 'Git integration process', u: 'https://learn.microsoft.com/en-us/fabric/cicd/git-integration/git-integration-process' }]
},
{
  id: 'd1-11', s: 'lcm', type: 'statements',
  stem: "A workspace is connected to an Azure DevOps repository.",
  statements: [
    { text: "The workspace can be connected to only one branch at a time.", answer: true },
    { text: "Committing a lakehouse writes the data in its Delta tables to the repository.", answer: false },
    { text: "Only a workspace admin can connect the workspace to Git or disconnect it.", answer: true },
  ],
  explain: "A workspace syncs with exactly one branch and folder. For a lakehouse, Git stores the item's **metadata/definition**, not its data. Tables and files stay in OneLake. Managing the Git connection is a workspace admin task. Contributors can commit and update once the connection exists.",
  refs: [{ t: 'Git integration overview', u: 'https://learn.microsoft.com/en-us/fabric/cicd/git-integration/intro-to-git-integration' }]
},
{
  id: 'd1-12', s: 'lcm', type: 'single',
  stem: "You need to manage the schema of a Fabric warehouse as code. Every change must be validated by a build in a CI pipeline and deployed to several warehouses by using SqlPackage. What should you use?",
  options: [
    "A SQL database project (`.sqlproj`) that builds a `.dacpac`",
    "A deployment pipeline with three stages",
    "A notebook that runs `CREATE TABLE` statements",
    "A Dataflow Gen2 for each table",
  ],
  answer: 0,
  explain: "**SQL database projects** keep each object as a script, check the model when you build, and output a `.dacpac`. SqlPackage can then deploy that `.dacpac` to any target. This is the standard way to do CI/CD for warehouse schemas, and Fabric warehouses can be extracted to and published from projects.\n\nDeployment pipelines can move warehouses between workspaces, but they don't give you a build or validation step that SqlPackage can deploy. Notebooks and dataflows don't manage schemas declaratively.",
  refs: [{ t: 'SQL database projects', u: 'https://learn.microsoft.com/en-us/sql/tools/sql-database-projects/sql-database-projects' }]
},
{
  id: 'd1-13', s: 'lcm', type: 'statements',
  stem: "You are designing deployment pipelines in Fabric.",
  statements: [
    { text: "A deployment pipeline can have between 2 and 10 stages.", answer: true },
    { text: "Each stage is assigned exactly one workspace.", answer: true },
    { text: "Deploying a lakehouse to the next stage also copies the data in its tables.", answer: false },
  ],
  explain: "Deployment pipelines support 2 to 10 stages, each linked to one workspace. Deployment copies item **definitions and metadata**, not data. A deployed lakehouse arrives empty in the target stage and has to be loaded there.",
  refs: [{ t: 'Deployment pipelines overview', u: 'https://learn.microsoft.com/en-us/fabric/cicd/deployment-pipelines/intro-to-deployment-pipelines' }]
},
{
  id: 'd1-14', s: 'lcm', type: 'single',
  stem: "A data pipeline connects to a different SQL server in each of the Dev, Test and Prod stages. After each deployment, someone has to edit the connection by hand. You need a solution that sets the right value per stage automatically. What should you use?",
  options: [
    "A **variable library** with a value set for each stage, referenced from the pipeline",
    "Pipeline parameters with default values",
    "A semantic model data source rule",
    "Separate pipelines for each stage",
  ],
  answer: 0,
  explain: "A **variable library** holds named variables with a value set per stage. Items such as pipelines and notebooks read the active value set, so the same definition works in every stage without editing.\n\nParameter defaults still have to be edited in each stage. Data source rules apply to semantic models, not to pipelines. Separate pipelines per stage defeat the purpose of promotion.",
  refs: [{ t: 'Variable libraries', u: 'https://learn.microsoft.com/en-us/fabric/cicd/variable-library/variable-library-overview' }]
},
{
  id: 'd1-15', s: 'lcm', type: 'single',
  stem: "You changed five items in the Development stage, but only one notebook is ready to move to Test. What should you do?",
  options: [
    "In the deployment pipeline, select only that notebook and deploy the selected items",
    "Create a second deployment pipeline that contains only the notebook",
    "Deploy all items and roll back the four unfinished ones in Test",
    "Commit only the notebook to Git; deployment pipelines then deploy only committed items",
  ],
  answer: 0,
  explain: "Deployment pipelines support **selective deployment**: in the compare view, choose the items to deploy. Each workspace can be assigned to only one deployment pipeline, and deploying then rolling back is risky and wasteful. Deployment pipelines compare workspace content; they don't read Git commit status.",
  refs: [{ t: 'Deploy content', u: 'https://learn.microsoft.com/en-us/fabric/cicd/deployment-pipelines/deploy-content' }]
},
{
  id: 'd1-16', s: 'lcm', type: 'order',
  stem: "You need to set up a deployment pipeline for LO-Dev, LO-Test and LO-Prod. The semantic model in Test must use a different data source than in Dev. Which four actions should you perform in sequence?",
  options: [
    "Create a deployment pipeline with three stages",
    "Assign LO-Dev to the first stage",
    "Deploy the content from the first stage to the Test stage",
    "Create a data source rule for the semantic model in the Test stage, then deploy again",
    "Create the data source rule in the Development stage before any deployment",
    "Assign LO-Test to the first stage",
  ],
  answer: [0, 1, 2, 3],
  explain: "Create the pipeline and assign the development workspace to the first stage. Rules are set on the **target** stage and only for items that already exist there, so deploy once to Test first. Rules take effect on the **next** deployment, so deploy again after creating the rule.\n\nRules cannot be set on the source (Development) stage.",
  refs: [{ t: 'Create deployment rules', u: 'https://learn.microsoft.com/en-us/fabric/cicd/deployment-pipelines/create-rules' }]
},

// ---------- Security and governance ----------
{
  id: 'd1-17', s: 'sec', type: 'single',
  stem: "A user must be able to add people to a workspace as Contributors or Viewers and share items. The user must not be able to delete the workspace or add workspace admins. Which role should you assign?",
  options: ['Member', 'Admin', 'Contributor', 'Viewer'],
  answer: 0,
  explain: "**Member** can add people with the Member, Contributor or Viewer role and can share items, but cannot delete the workspace or manage admins. **Admin** can do both of those. **Contributor** cannot manage access. **Viewer** is read-only.",
  refs: [{ t: 'Roles in workspaces', u: 'https://learn.microsoft.com/en-us/fabric/fundamentals/roles-workspaces' }]
},
{
  id: 'd1-18', s: 'sec', type: 'statements',
  stem: "A user has the Viewer role in a workspace that contains a lakehouse, a warehouse and a notebook.",
  statements: [
    { text: "The user can query the lakehouse tables through the SQL analytics endpoint.", answer: true },
    { text: "The user can run the notebook.", answer: false },
    { text: "The user can add another user to the workspace.", answer: false },
  ],
  explain: "Viewers can read data through SQL (the warehouse and the lakehouse SQL analytics endpoint), subject to any SQL security you define. They can view notebooks but not run or edit them, which needs Contributor or higher. Only Admins and Members can manage workspace access.",
  refs: [{ t: 'Roles in workspaces', u: 'https://learn.microsoft.com/en-us/fabric/fundamentals/roles-workspaces' }]
},
{
  id: 'd1-19', s: 'sec', type: 'single',
  stem: "A user who is not a member of the workspace must be able to query only the `dbo.Sales` table of a lakehouse by using the SQL analytics endpoint. What should you do?",
  options: [
    "Share the lakehouse without additional permissions, then run `GRANT SELECT ON dbo.Sales` for the user on the SQL analytics endpoint",
    "Share the lakehouse and select **Read all SQL endpoint data**",
    "Add the user to the workspace Viewer role",
    "Share the lakehouse and select **Read all Apache Spark**",
  ],
  answer: 0,
  explain: "Sharing with no extra checkboxes gives **Read**: the user can connect to the SQL analytics endpoint but sees no data until you grant it. A granular `GRANT SELECT` then opens exactly one table.\n\n**Read all SQL endpoint data** opens every table. Viewer opens the whole workspace. **Read all Apache Spark** gives OneLake file access to all the data.",
  refs: [{ t: 'Share a lakehouse', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-sharing' }, { t: 'SQL granular permissions', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/sql-granular-permissions' }]
},
{
  id: 'd1-20', s: 'sec', type: 'single',
  stem: "A data scientist in another workspace needs to read all files and tables of your lakehouse from a Spark notebook. The data scientist must not be added to your workspace. Which permission should you grant when sharing the lakehouse?",
  options: ['Read all Apache Spark (ReadAll)', 'Read all SQL endpoint data (ReadData)', 'Build reports on the default semantic model (Build)', 'No additional permissions (Read only)'],
  answer: 0,
  explain: "Spark reads data straight from OneLake, so it needs **ReadAll**, shown as 'Read all Apache Spark' when you share. ReadData works only through the SQL engine. Build applies to semantic models. Read alone lets the user see the item but not its data.",
  refs: [{ t: 'Share a lakehouse', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-sharing' }]
},
{
  id: 'd1-21', s: 'sec', type: 'dropdown',
  stem: "Analysts can read every column of `dbo.Employee` in a warehouse through the ReadData permission. You need to stop them from reading the `Salary` column. How should you complete the statement?",
  code:
`[[0]] SELECT ON dbo.Employee ([[1]]) TO [Analysts];`,
  blanks: [
    { options: ['DENY', 'GRANT', 'REVOKE'], answer: 0 },
    { options: ['Salary', 'EmployeeID', '*'], answer: 0 },
  ],
  explain: "Column-level security uses GRANT/DENY with a column list. Because the analysts already have SELECT on the whole table, you need a column-level `DENY` on `Salary`, which overrides the broader grant. Analysts who then run `SELECT *` get an error, so they must list the columns they're allowed to read.\n\nREVOKE only removes an earlier GRANT; it doesn't block access that comes from ReadData.",
  refs: [{ t: 'Column-level security', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/column-level-security' }]
},
{
  id: 'd1-22', s: 'sec', type: 'statements',
  stem: "You are implementing row-level security (RLS) in a Fabric warehouse.",
  statements: [
    { text: "The predicate function is an inline table-valued function, typically created WITH SCHEMABINDING.", answer: true },
    { text: "Fabric Data Warehouse supports BLOCK predicates to prevent inserts of rows the user cannot see.", answer: false },
    { text: "A Direct Lake semantic model that reads a warehouse table protected by RLS falls back to DirectQuery so the RLS is enforced.", answer: true },
  ],
  explain: "RLS predicates are inline TVFs bound by a security policy. Schema binding is the default and the recommended approach. Fabric warehouses support **filter** predicates only.\n\nDirect Lake reads Delta files directly, so it can't enforce SQL-level RLS. When it sees RLS in the warehouse it **falls back to DirectQuery** to keep the security rules.",
  refs: [{ t: 'Row-level security', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/row-level-security' }, { t: 'Direct Lake fallback', u: 'https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-overview' }]
},
{
  id: 'd1-23', s: 'sec', type: 'single',
  stem: "You added a dynamic data mask to `dbo.Customer.Phone`. Members of the Sales team still see full phone numbers. They are Contributors in the workspace. What is the cause?",
  options: [
    "Workspace Admins, Members and Contributors have elevated permissions and always see unmasked data",
    "Masks apply only to new rows inserted after the mask was created",
    "Masks apply only to queries from Power BI",
    "The mask must be enabled with `ALTER DATABASE ... SET MASKING ON`",
  ],
  answer: 0,
  explain: "Users in the **Admin, Member and Contributor** roles hold elevated rights on the warehouse and see unmasked data. To make the mask apply, give the Sales team the Viewer role or item-level access instead.\n\nMasks apply at query time to all rows and all clients, and there is no database-level switch.",
  refs: [{ t: 'Dynamic data masking', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/dynamic-data-masking' }]
},
{
  id: 'd1-24', s: 'sec', type: 'single',
  stem: "Which statement about dynamic data masking in a Fabric warehouse is true?",
  options: [
    "It masks values in query results; the stored data is unchanged, and users with UNMASK see the real values",
    "It encrypts the column in storage",
    "It stops users from guessing masked values with WHERE clauses",
    "It can only be added when the table is created",
  ],
  answer: 0,
  explain: "Dynamic data masking changes **only what query results show**. Data at rest stays the same. A user who can query the column could still guess values with predicates (for example `WHERE Salary > 100000`), so masking supplements real access control rather than replacing it. You can add masks to existing columns with `ALTER TABLE ... ALTER COLUMN ... ADD MASKED`.",
  refs: [{ t: 'Dynamic data masking', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/dynamic-data-masking' }]
},
{
  id: 'd1-25', s: 'sec', type: 'single',
  stem: "A lakehouse contains the folders `Files/HR` and `Files/Finance`. The Finance analysts group must be able to read only `Files/Finance` from Spark and OneLake file explorer. The analysts have Read permission on the lakehouse and no workspace role. What should you do?",
  options: [
    "Create a OneLake security (data access) role that includes `Files/Finance` and add the group to it",
    "Add the group to the workspace Contributor role and create a OneLake role for `Files/Finance`",
    "Create a row-level security policy on the SQL analytics endpoint",
    "Share the lakehouse with Read all SQL endpoint data",
  ],
  answer: 0,
  explain: "**OneLake security roles** (data access roles) grant access to specific folders or tables in OneLake for users who don't have elevated workspace rights.\n\nWorkspace Admins, Members and Contributors **bypass** these roles, so adding the group as Contributor would expose `Files/HR`. SQL RLS doesn't apply to files read from Spark. ReadData is about SQL access.",
  refs: [{ t: 'OneLake security', u: 'https://learn.microsoft.com/en-us/fabric/onelake/security/get-started-security' }]
},
{
  id: 'd1-26', s: 'sec', type: 'single',
  stem: "A lakehouse has the sensitivity label **Confidential**. You want semantic models and reports created from it to get the same label automatically. What makes this happen?",
  options: [
    "Downstream inheritance of sensitivity labels, enabled by a Fabric admin in the tenant settings",
    "Endorsing the lakehouse as Certified",
    "Applying the label again to every new item by hand",
    "Enabling OneLake security on the lakehouse",
  ],
  answer: 0,
  explain: "Microsoft Purview Information Protection labels can **flow downstream** from an item to the content built on it. A Fabric admin turns this on in the tenant settings, and it then applies across workspaces.\n\nEndorsement and OneLake security don't apply labels.",
  refs: [{ t: 'Information protection in Fabric', u: 'https://learn.microsoft.com/en-us/fabric/governance/information-protection' }]
},
{
  id: 'd1-27', s: 'sec', type: 'statements',
  stem: "You are endorsing items in Fabric.",
  statements: [
    { text: "Any user with write permission on an item can mark it as Promoted.", answer: true },
    { text: "Any workspace Admin can mark an item as Certified without further authorization.", answer: false },
    { text: "Master data endorsement identifies items that are an authoritative single source of core business data.", answer: true },
  ],
  explain: "**Promoted** is self-service for anyone who can edit the item. **Certified** and **Master data** need users authorized by a Fabric admin in the tenant settings; being a workspace admin is not enough. Master data marks reference data such as customer or product lists as the authoritative source.",
  refs: [{ t: 'Endorsement overview', u: 'https://learn.microsoft.com/en-us/fabric/governance/endorsement-overview' }]
},
{
  id: 'd1-28', s: 'sec', type: 'single',
  stem: "You need to create a shortcut to an ADLS Gen2 account whose firewall blocks public network access. The solution must not open the firewall to all Azure services. What should you configure?",
  options: [
    "A workspace identity for the Fabric workspace and a resource instance rule (trusted workspace access) on the storage account",
    "An on-premises data gateway",
    "A shared access signature with no expiry",
    "The OneLake shortcut cache",
  ],
  answer: 0,
  explain: "**Trusted workspace access** lets a specific Fabric workspace through a storage firewall. You create a **workspace identity**, then add a resource instance rule for that workspace on the storage account. The shortcut uses an organizational account, a service principal or the workspace identity for authentication.\n\nA gateway is for on-premises sources. A non-expiring SAS is insecure and doesn't get past the network firewall. The cache doesn't affect access.",
  refs: [{ t: 'Trusted workspace access', u: 'https://learn.microsoft.com/en-us/fabric/security/security-trusted-workspace-access' }, { t: 'Workspace identity', u: 'https://learn.microsoft.com/en-us/fabric/security/workspace-identity' }]
},
{
  id: 'd1-29', s: 'sec', type: 'single',
  stem: "Members of the Analysts group must see only the views in the `reporting` schema of a warehouse and none of the tables in the `dbo` schema. The analysts connect through a share that gives Read only. What should you do?",
  options: [
    "`GRANT SELECT ON SCHEMA::reporting TO [Analysts]`",
    "Share the warehouse with Read all data using SQL",
    "Create a row-level security policy on every table in `dbo`",
    "`DENY SELECT ON SCHEMA::reporting TO [Analysts]`",
  ],
  answer: 0,
  explain: "Object-level security in a warehouse uses the standard T-SQL GRANT/DENY at the object or schema level. Users who have only Read see nothing until granted, so a schema-level GRANT on `reporting` exposes exactly those views. If the views reference `dbo` tables with the same owner, ownership chaining lets the views work without granting the tables.\n\nReadData would open every table. RLS filters rows, not objects.",
  refs: [{ t: 'SQL granular permissions', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/sql-granular-permissions' }]
},

// ---------- Orchestration ----------
{
  id: 'd1-30', s: 'orch', type: 'single',
  stem: "You need to copy 200 tables from an Azure SQL Database into a lakehouse every night without any transformations. The solution must minimize coding. What should you use?",
  options: [
    "A pipeline with a Lookup activity that lists the tables and a ForEach activity that runs a Copy activity",
    "A notebook that loops over the tables with JDBC",
    "An eventstream with an Azure SQL Database CDC source",
    "A KQL update policy",
  ],
  answer: 0,
  explain: "Pipelines are the low-code choice for orchestrated bulk movement. The metadata-driven pattern of Lookup, then ForEach, then a parameterized Copy handles hundreds of tables with one definition. A **Copy job** is another low-code option for this.\n\nA notebook means writing and maintaining code. Eventstream CDC is for streaming changes. Update policies are KQL-only.",
  refs: [{ t: 'ForEach activity', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/foreach-activity' }]
},
{
  id: 'd1-31', s: 'orch', type: 'single',
  stem: "A transformation needs a Python library for fuzzy matching, a custom windowing algorithm and unit-tested helper functions. Which item should run it?",
  options: ['A notebook', 'A Dataflow Gen2', 'A Copy activity', 'A Lookup activity'],
  answer: 0,
  explain: "Notebooks run PySpark or Python with any library, which suits complex, code-heavy logic. Dataflows are low-code Power Query, and Copy and Lookup only move or read data.\n\nRule of thumb for the exam: **pipeline** to orchestrate and move data, **notebook** for complex code transformations, **dataflow** for low-code transformations by Power Query users.",
  refs: [{ t: 'Choose a data integration strategy', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/decision-guide-data-integration' }]
},
{
  id: 'd1-32', s: 'orch', type: 'dropdown',
  stem: "A Lookup activity named `GetTables` has **First row only** cleared and returns rows with the columns `SchemaName` and `TableName`. A ForEach activity iterates over the result, and a Copy activity inside it copies each table. How should you complete the expressions?",
  code:
`ForEach > Items:
  @activity('GetTables').output.[[0]]

Copy > Source > Table name:
  @item().[[1]]`,
  blanks: [
    { options: ['value', 'firstRow', 'rows', 'items'], answer: 0 },
    { options: ['TableName', 'value', 'name', 'output'], answer: 0 },
  ],
  explain: "With **First row only** cleared, a Lookup returns `output.count` and `output.value`, which is an array of row objects. With it selected, the output is `output.firstRow`. Inside a ForEach, `@item()` is the current element, so `@item().TableName` reads that row's column.",
  refs: [{ t: 'Lookup activity', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/lookup-activity' }, { t: 'Expressions and functions', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/expression-language' }]
},
{
  id: 'd1-33', s: 'orch', type: 'single',
  stem: "A notebook ends with `notebookutils.notebook.exit(str(row_count))`. A later pipeline activity must use that value. Which expression should you use?",
  options: [
    "`@activity('Notebook1').output.result.exitValue`",
    "`@activity('Notebook1').output.exitValue`",
    "`@activity('Notebook1').output.firstRow`",
    "`@pipeline().parameters.exitValue`",
  ],
  answer: 0,
  explain: "The Notebook activity returns the exit value under `output.result.exitValue`. It's always a string, so convert it with `int()` if you need a number. `firstRow` belongs to the Lookup activity. Pipeline parameters are inputs, not outputs.",
  refs: [{ t: 'Notebook activity', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/notebook-activity' }, { t: 'NotebookUtils', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/notebook-utilities' }]
},
{
  id: 'd1-34', s: 'orch', type: 'single',
  stem: "A pipeline must pass a `load_date` value to a notebook. In the notebook, `load_date = '2000-01-01'` is defined in the first cell. What else must you do?",
  options: [
    "Mark that cell as the **parameter cell** and add `load_date` as a base parameter in the Notebook activity",
    "Read `load_date` from an environment variable",
    "Add `load_date` to the workspace Spark properties",
    "Call `notebookutils.notebook.exit(load_date)` at the start of the notebook",
  ],
  answer: 0,
  explain: "When a cell is toggled as the **parameter cell**, Fabric inserts a new cell after it at run time with the values passed in. That's why the parameter cell holds the defaults. Base parameters on the Notebook activity supply those values, and they can be dynamic expressions.",
  refs: [{ t: 'Notebook parameters', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/author-execute-notebook#designate-a-parameters-cell' }]
},
{
  id: 'd1-35', s: 'orch', type: 'single',
  stem: "From a driver notebook, you need to run six notebooks. Two of them depend on the first one, and the rest can run in parallel. All of them must share the driver's Spark session. What should you use?",
  options: [
    "`notebookutils.notebook.runMultiple()` with a DAG that defines the dependencies",
    "`%run` for each notebook",
    "Six Notebook activities in a pipeline with high concurrency turned off",
    "`notebookutils.fs.cp()`",
  ],
  answer: 0,
  explain: "`runMultiple` runs several notebooks in the current session, in parallel or as a **DAG** with dependencies, timeouts and a concurrency limit. `%run` runs notebooks one at a time inline. Separate pipeline activities without high concurrency each start their own session. `fs.cp` copies files.",
  refs: [{ t: 'NotebookUtils: runMultiple', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/notebook-utilities' }]
},
{
  id: 'd1-36', s: 'orch', type: 'single',
  stem: "A pipeline must start as soon as a new file lands in a container in an Azure Blob Storage account. What should you configure?",
  options: [
    "A trigger based on Azure Blob Storage events on the pipeline",
    "A schedule that runs every minute",
    "An Until activity that polls the container with Get Metadata",
    "A deployment rule",
  ],
  answer: 0,
  explain: "Pipelines can be triggered by **storage events** such as a blob being created. The event subscription goes through the Real-Time hub and Activator, and the trigger can filter on container, folder and file name. Polling with a schedule or an Until loop adds delay and wastes capacity.",
  refs: [{ t: 'Storage event triggers', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/pipeline-storage-event-triggers' }]
},
{
  id: 'd1-37', s: 'orch', type: 'statements',
  stem: "You are designing activity dependencies in a pipeline.",
  statements: [
    { text: "An activity connected with **On completion** runs whether the upstream activity succeeds or fails.", answer: true },
    { text: "An activity connected with **On skip** runs when the upstream activity did not run.", answer: true },
    { text: "If an activity has an On success dependency from A and an On fail dependency from B, it runs when either condition is met.", answer: false },
  ],
  explain: "Dependency conditions are success, failure, completion and skipped. When an activity has **several** dependencies, they combine with **AND**: all of them must be met. To act on 'A succeeded OR B failed', you need separate paths or a pattern such as an If Condition.",
  refs: [{ t: 'Activity overview', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/activity-overview' }]
},
{
  id: 'd1-38', s: 'orch', type: 'single',
  stem: "A ForEach activity copies files into the same Delta table. Running the iterations at the same time causes write conflicts. What should you do?",
  options: [
    "Select **Sequential** on the ForEach activity",
    "Increase the batch count to 50",
    "Set Retry to 5 on the Copy activity",
    "Add a Wait activity after the ForEach",
  ],
  answer: 0,
  explain: "ForEach runs iterations in parallel by default; the batch count sets how many run at once. Selecting **Sequential** runs one iteration at a time and removes the concurrent writes. A higher batch count makes the problem worse. Retries don't prevent the conflict.",
  refs: [{ t: 'ForEach activity', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/foreach-activity' }]
},
{
  id: 'd1-39', s: 'orch', type: 'single',
  stem: "A parent pipeline must call a child pipeline and continue only after the child has finished. What should you configure?",
  options: [
    "An Invoke pipeline activity with **Wait on completion** selected",
    "A Notebook activity that calls the child pipeline's REST API",
    "Two schedules five minutes apart",
    "A Set variable activity",
  ],
  answer: 0,
  explain: "The **Invoke pipeline** activity runs another pipeline. With **Wait on completion** selected, the parent waits and reports the child's success or failure. Without it, the parent continues right after starting the child. Separate schedules don't guarantee the order.",
  refs: [{ t: 'Invoke pipeline activity', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/invoke-pipeline-activity' }]
},
{
  id: 'd1-40', s: 'orch', type: 'single',
  stem: "A pipeline starts an export job through a REST API and must wait until a status endpoint returns `Completed`, checking every 30 seconds. Which activities should you use?",
  options: [
    "An Until activity that contains a Web activity and a Wait activity",
    "A ForEach activity with a batch count of 30",
    "An If Condition activity",
    "A Switch activity",
  ],
  answer: 0,
  explain: "**Until** repeats its inner activities until an expression is true, for example `@equals(activity('CheckStatus').output.status, 'Completed')`. A Web activity checks the status and a Wait activity adds the 30-second pause. Set a timeout on the Until activity so it can't loop forever.\n\nIf Condition and Switch run once. ForEach iterates over a fixed list.",
  refs: [{ t: 'Until activity', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/until-activity' }]
},
{
  id: 'd1-41', s: 'orch', type: 'dropdown',
  stem: "A Copy activity must write to a folder named after the date and time the pipeline was triggered, for example `raw/sales/2026/11/10`. How should you complete the expression?",
  code:
`@concat('raw/sales/', [[0]]([[1]], 'yyyy/MM/dd'))`,
  blanks: [
    { options: ['formatDateTime', 'concat', 'string', 'addDays'], answer: 0 },
    { options: ['pipeline().TriggerTime', 'item()', "activity('Copy').output", 'pipeline().RunId'], answer: 0 },
  ],
  explain: "`formatDateTime(timestamp, format)` turns a timestamp into a string. `pipeline().TriggerTime` is the time the run was triggered, which stays the same for the whole run. `utcNow()` would change between activities. `RunId` is a GUID and `item()` only exists inside a ForEach.",
  refs: [{ t: 'Expressions and functions', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/expression-language' }]
},

// ---------- Yes/No series: least-privilege SQL access ----------
{
  id: 'd1-s1a', s: 'sec', type: 'single', series: 's1',
  stem: "**This question is part of a series that presents the same scenario. Each question has a unique solution. Determine whether the solution meets the goal.**\n\nA workspace contains a warehouse named WH_Sales, a lakehouse and several notebooks. Members of the Analysts group must be able to query all tables in WH_Sales by using T-SQL. They must not be able to access any other item in the workspace.\n\nSolution: You add the Analysts group to the workspace **Viewer** role.\n\nDoes this meet the goal?",
  options: ['Yes', 'No'],
  answer: 1,
  explain: "**No.** Viewer is a workspace role, so it gives read access to **every** item in the workspace, including the lakehouse through its SQL endpoint and the notebooks.",
  refs: [{ t: 'Roles in workspaces', u: 'https://learn.microsoft.com/en-us/fabric/fundamentals/roles-workspaces' }]
},
{
  id: 'd1-s1b', s: 'sec', type: 'single', series: 's1',
  stem: "**This question is part of a series that presents the same scenario. Each question has a unique solution. Determine whether the solution meets the goal.**\n\nA workspace contains a warehouse named WH_Sales, a lakehouse and several notebooks. Members of the Analysts group must be able to query all tables in WH_Sales by using T-SQL. They must not be able to access any other item in the workspace.\n\nSolution: You share WH_Sales with the Analysts group and select **Read all data using SQL**.\n\nDoes this meet the goal?",
  options: ['Yes', 'No'],
  answer: 0,
  explain: "**Yes.** Sharing one item gives access to that item only, and ReadData lets the group query all its tables with T-SQL.",
  refs: [{ t: 'Share a warehouse', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/share-warehouse-manage-permissions' }]
},
{
  id: 'd1-s1c', s: 'sec', type: 'single', series: 's1',
  stem: "**This question is part of a series that presents the same scenario. Each question has a unique solution. Determine whether the solution meets the goal.**\n\nA workspace contains a warehouse named WH_Sales, a lakehouse and several notebooks. Members of the Analysts group must be able to query all tables in WH_Sales by using T-SQL. They must not be able to access any other item in the workspace.\n\nSolution: You share WH_Sales with the Analysts group and select only **Read all OneLake data**.\n\nDoes this meet the goal?",
  options: ['Yes', 'No'],
  answer: 1,
  explain: "**No.** ReadAll gives access to the underlying files in OneLake (for example from Spark). It doesn't give the ReadData permission needed to query the tables with T-SQL.",
  refs: [{ t: 'Share a warehouse', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/share-warehouse-manage-permissions' }]
}
);
