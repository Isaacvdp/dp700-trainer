// Case studies and their questions. All scenarios and companies are fictional.
window.DP700 = window.DP700 || { cases: [], questions: [] };

DP700.cases.push(
{
  id: 'c1',
  title: 'Lindqvist Outdoor',
  sections: [
    { h: 'Overview', body:
"Lindqvist Outdoor is a Nordic retailer of outdoor gear with 140 stores and an online shop. The company is moving its analytics platform to Microsoft Fabric on an F64 capacity.\n\nThe data platform team uses three workspaces: **LO-Dev**, **LO-Test** and **LO-Prod**. Each workspace contains a lakehouse named **LH_Bronze**, a lakehouse named **LH_Silver** and a warehouse named **WH_Gold**." },
    { h: 'Existing environment', body:
"- Sales transactions are stored in an Azure SQL Database named **SalesDB**. About 2 million rows are inserted or updated per day.\n- The product catalog is delivered nightly by suppliers as **Parquet** files to the container `catalog` in an Azure Data Lake Storage Gen2 account. Hierarchical namespace is enabled.\n- Web clickstream events are sent to Azure Event Hubs at about 5,000 events per second.\n- Each sales row has a `TransactionID` and a `ModifiedAt` column. Because of retries in the point-of-sale system, the same `TransactionID` can arrive several times with different `ModifiedAt` values.\n- WH_Gold contains a table named `dbo.StoreManager` with the columns `StoreID` and `ManagerUPN`." },
    { h: 'Data requirements', body:
"- Sales data from SalesDB must be available in Fabric with a latency of less than one minute. The solution must minimize development effort and must not require custom change data capture code.\n- The product catalog must be available in LH_Bronze **without copying the data**.\n- Clickstream events must be queryable within seconds. Marketing analysts query clickstream data by using KQL. Raw clickstream data must be kept for 90 days.\n- In LH_Silver, sales must contain one row per `TransactionID`, keeping the row with the latest `ModifiedAt`.\n- WH_Gold contains a star schema. `DimProduct` must keep the full history of price changes." },
    { h: 'Security requirements', body:
"- Members of the **StoreManagers** group must see only the rows in `dbo.FactSales` for their own store.\n- The `CustomerEmail` column in `dbo.DimCustomer` must appear masked to analysts but unmasked to the **CRM** group. Analysts and the CRM group access WH_Gold through item permissions only; they are not members of any workspace role.\n- Members of the **DataEngineers** group must be able to create and edit items in LO-Dev, but must not be able to manage workspace access.\n- The **Finance** group must be able to query all tables in WH_Gold in LO-Prod by using T-SQL. Finance must not be able to see any other items in LO-Prod and must not be able to read the underlying OneLake files.\n- Permissions must follow the principle of least privilege." },
    { h: 'Lifecycle requirements', body:
"- All items in LO-Dev must be under version control in Azure DevOps.\n- Content is promoted from LO-Dev to LO-Test to LO-Prod by using a deployment pipeline.\n- After deployment, notebooks in LO-Test and LO-Prod must use the LH_Silver lakehouse in their own workspace as the default lakehouse, without manual edits after each deployment." },
  ]
},
{
  id: 'c2',
  title: 'Nordvik Energi',
  sections: [
    { h: 'Overview', body:
"Nordvik Energi operates 30 wind farms in Norway. The company uses Microsoft Fabric on an F128 capacity. All operational analytics items are in a workspace named **NE-Operations**, which contains an eventhouse named **EH_Telemetry** (KQL database **Turbines**) and a lakehouse named **LH_Ops**." },
    { h: 'Existing environment', body:
"- Each turbine sends a telemetry message every 2 seconds to Azure IoT Hub. Messages are JSON with the fields `TurbineId`, `Timestamp`, `WindSpeed`, `RotorRPM`, `PowerKW` and `Status`. During commissioning, turbines send messages with `Status` set to `Test`.\n- Maintenance records are stored in an on-premises SQL Server 2019 database named **MaintDB**. An on-premises data gateway is installed and registered. Every table has a reliable `LastUpdated` column.\n- Weather forecasts are retrieved hourly from a REST API by a pipeline named **PL_Weather**. The API occasionally returns HTTP 503 errors that succeed on the next attempt.\n- Telemetry is stored in a KQL table named `Telemetry`." },
    { h: 'Requirements', body:
"- An operations dashboard must show the average `PowerKW` per turbine for each 5-minute period, in near real time.\n- Operators also want a chart that shows, every minute, each turbine's average power over the previous 5 minutes.\n- The maintenance team must receive a Microsoft Teams message when any turbine reports a `RotorRPM` above 20. The solution must not require code.\n- Raw telemetry must also be stored as Delta tables in LH_Ops for the data science team, with minimal development effort. Events with `Status` = `Test` must **not** be written to LH_Ops but must still reach the eventhouse.\n- Maintenance data must be loaded nightly into LH_Ops. Only rows that changed since the previous load may be copied.\n- PL_Weather must recover automatically from transient API errors.\n- Queries on the last 7 days of telemetry must be fast. Telemetry must be kept for one year. Data older than 7 days is rarely queried.\n- The on-call engineer must be notified when the nightly maintenance pipeline fails." },
  ]
});

DP700.questions.push(
// ---------------- Case 1: Lindqvist Outdoor ----------------
{
  id: 'c1-01', s: 'batch', case: 'c1', type: 'single',
  stem: "You need to make the SalesDB data available in Fabric to meet the data requirements. What should you use?",
  options: [
    "Mirroring for Azure SQL Database",
    "A pipeline with a Copy activity scheduled to run every minute",
    "A Dataflow Gen2 that refreshes every minute",
    "A notebook that reads SalesDB over JDBC on a schedule",
  ],
  answer: 0,
  explain: "Mirroring continuously replicates Azure SQL Database tables into OneLake as Delta tables, usually with seconds of latency, and Fabric manages the change tracking for you. No CDC code is needed.\n\nA pipeline, dataflow or notebook on a one-minute schedule cannot reliably hit sub-minute latency. You would also have to build the incremental logic yourself, and each run consumes capacity even when nothing changed.",
  refs: [{ t: 'Mirroring overview', u: 'https://learn.microsoft.com/en-us/fabric/mirroring/overview' }, { t: 'Mirroring Azure SQL Database', u: 'https://learn.microsoft.com/en-us/fabric/mirroring/azure-sql-database' }]
},
{
  id: 'c1-02', s: 'batch', case: 'c1', type: 'single',
  stem: "You need to make the product catalog available in LH_Bronze. What should you create?",
  options: [
    "An Azure Data Lake Storage Gen2 shortcut in the **Files** section of LH_Bronze that points to the `catalog` container",
    "An Azure Data Lake Storage Gen2 shortcut in the **Tables** section of LH_Bronze that points to the `catalog` container",
    "A pipeline Copy activity that copies the Parquet files to the Files section of LH_Bronze",
    "A mirrored database for the storage account",
  ],
  answer: 0,
  explain: "A shortcut makes data available in OneLake without copying it. The catalog arrives as plain **Parquet** files, not Delta tables. Shortcuts in the **Tables** section are only recognised as tables when the target folder is in Delta format, so the right place is the **Files** section. You can read the files from Spark and convert them to Delta in a later layer.\n\nA Copy activity copies the data, which breaks the requirement. Mirroring is for databases, not for a storage account.",
  refs: [{ t: 'OneLake shortcuts', u: 'https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts' }, { t: 'Create an ADLS Gen2 shortcut', u: 'https://learn.microsoft.com/en-us/fabric/onelake/create-adls-shortcut' }]
},
{
  id: 'c1-03', s: 'stream', case: 'c1', type: 'statements',
  stem: "You are designing the clickstream solution.",
  statements: [
    { text: "You should create an eventstream with an Azure Event Hubs source and an eventhouse destination.", answer: true },
    { text: "You should set the retention policy of the clickstream table (or its KQL database) to a soft-delete period of 90 days.", answer: true },
    { text: "You should write the clickstream to LH_Silver as Delta tables so that marketing analysts can query it with KQL.", answer: false },
  ],
  explain: "An eventstream can read directly from Azure Event Hubs and route the events to an eventhouse. There they can be queried with KQL within seconds of arrival.\n\nThe retention policy's `SoftDeletePeriod` sets how long data is kept, so 90 days meets the requirement.\n\nKQL queries run against KQL databases in an eventhouse, not against lakehouse Delta tables. You could expose lakehouse data through a shortcut, but that adds latency and is not what the requirement asks for.",
  refs: [{ t: 'Eventstreams overview', u: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/event-streams/overview' }, { t: 'Retention policy', u: 'https://learn.microsoft.com/en-us/kusto/management/retention-policy' }]
},
{
  id: 'c1-04', s: 'sec', case: 'c1', type: 'dropdown',
  stem: "You need to implement the security requirement for the StoreManagers group. How should you complete the T-SQL?",
  code:
`CREATE FUNCTION sec.fn_store_filter(@StoreID AS int)
    RETURNS TABLE
WITH SCHEMABINDING
AS
    RETURN SELECT 1 AS allowed
    FROM dbo.StoreManager AS m
    WHERE m.StoreID = @StoreID
      AND m.ManagerUPN = [[0]];
GO
CREATE SECURITY POLICY sec.StoreFilter
ADD [[1]] PREDICATE sec.fn_store_filter(StoreID)
ON dbo.FactSales
WITH (STATE = ON);`,
  blanks: [
    { options: ['USER_NAME()', '@@SERVERNAME', 'APP_NAME()', 'HOST_NAME()'], answer: 0 },
    { options: ['FILTER', 'BLOCK', 'MASK', 'ROW'], answer: 0 },
  ],
  explain: "Row-level security in a Fabric warehouse uses an inline table-valued function as the predicate, bound to the table by a security policy. `USER_NAME()` returns the name of the user running the query, which in Fabric is their Microsoft Entra user principal name, so it can be compared with `ManagerUPN`.\n\nFabric Data Warehouse supports only **FILTER** predicates, which silently remove rows the user may not see. BLOCK predicates are not supported. MASK and ROW are not predicate types.",
  refs: [{ t: 'Row-level security in Fabric Data Warehouse', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/row-level-security' }]
},
{
  id: 'c1-05', s: 'sec', case: 'c1', type: 'dropdown',
  stem: "You need to implement the security requirement for the `CustomerEmail` column. How should you complete the T-SQL?",
  code:
`ALTER TABLE dbo.DimCustomer
ALTER COLUMN CustomerEmail
ADD MASKED WITH (FUNCTION = '[[0]]');

GRANT [[1]] TO [CRM];`,
  blanks: [
    { options: ['email()', 'random(1, 100)', 'hash()', 'encrypt()'], answer: 0 },
    { options: ['UNMASK', 'SELECT', 'CONTROL', 'VIEW DEFINITION'], answer: 0 },
  ],
  explain: "`email()` is the built-in dynamic data masking function for email addresses. It shows the first letter and a constant suffix, for example `aXXX@XXXX.com`. `random()` applies only to numeric columns. `hash()` and `encrypt()` are not masking functions.\n\nUsers with the **UNMASK** permission see the real values. SELECT only lets users read the masked data. CONTROL would give the CRM group far more than they need.\n\nRemember that workspace Admins, Members and Contributors always see unmasked data. That's why this case gives access through item permissions only.",
  refs: [{ t: 'Dynamic data masking', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/dynamic-data-masking' }]
},
{
  id: 'c1-06', s: 'sec', case: 'c1', type: 'single',
  stem: "You need to grant the Finance group access to WH_Gold in LO-Prod. What should you do?",
  options: [
    "Share WH_Gold with Finance and select **Read all data using SQL**.",
    "Add Finance to the **Viewer** role of LO-Prod.",
    "Share WH_Gold with Finance and select **Read all OneLake data**.",
    "Share WH_Gold with Finance without selecting any additional permissions.",
  ],
  answer: 0,
  explain: "Sharing the warehouse gives access to that one item. The **Read all data using SQL** option (the ReadData permission) lets users query every table with T-SQL without giving them OneLake file access.\n\nThe Viewer role would show Finance every item in LO-Prod. **Read all OneLake data** (ReadAll) is exactly the file access Finance must not have. Sharing with no extra permissions gives only Read, which lets users connect but not query tables until you add granular GRANTs.",
  refs: [{ t: 'Share a warehouse and manage permissions', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/share-warehouse-manage-permissions' }]
},
{
  id: 'c1-07', s: 'sec', case: 'c1', type: 'single',
  stem: "Which workspace role should you assign to the DataEngineers group in LO-Dev?",
  options: ['Contributor', 'Member', 'Admin', 'Viewer'],
  answer: 0,
  explain: "**Contributor** can create, edit and delete items but cannot add or remove people. **Member** can also add users and share items, which breaks the requirement. **Admin** can do everything, including deleting the workspace. **Viewer** cannot create or edit items.",
  refs: [{ t: 'Roles in workspaces', u: 'https://learn.microsoft.com/en-us/fabric/fundamentals/roles-workspaces' }]
},
{
  id: 'c1-08', s: 'lcm', case: 'c1', type: 'single',
  stem: "You need to meet the lifecycle requirement for notebooks in LO-Test and LO-Prod. What should you configure?",
  options: [
    "A **default lakehouse** deployment rule for each notebook in the Test and Production stages",
    "A branch policy in the Azure DevOps repository",
    "A workspace identity for LO-Test and LO-Prod",
    "A shortcut in each LH_Silver that points to LH_Silver in LO-Dev",
  ],
  answer: 0,
  explain: "Deployment rules change item settings when content is deployed to a stage. Notebooks support a **default lakehouse** rule, so each deployed notebook points to the lakehouse in its own stage's workspace with no manual edits.\n\nBranch policies control pull requests in Git, not deployment targets. A workspace identity is for authentication. A shortcut back to Dev would make Test and Prod read development data.",
  refs: [{ t: 'Create deployment rules', u: 'https://learn.microsoft.com/en-us/fabric/cicd/deployment-pipelines/create-rules' }]
},
{
  id: 'c1-09', s: 'load', case: 'c1', type: 'order',
  stem: "A product's price changes in the source system. You need to update `DimProduct` to meet the data requirements. Which three actions should you perform in sequence?",
  options: [
    "Compare staged products with current dimension rows on the business key and tracked attributes to find changed products",
    "Update the current row for each changed product: set `ValidTo` to the load date and `IsCurrent` to 0",
    "Insert a new row for each changed product with a new surrogate key, `ValidFrom` set to the load date and `IsCurrent` set to 1",
    "Update the price on the existing dimension row",
    "Delete the existing dimension row for each changed product",
  ],
  answer: [0, 1, 2],
  explain: "Keeping the full history means a **Type 2** slowly changing dimension. First find the changed rows. Then close the current version by setting its end date and current flag. Finally, insert a new version with a new surrogate key. Existing fact rows keep pointing at the old version, so historical reports stay correct.\n\nUpdating the price in place is Type 1 and loses history. Deleting rows breaks the facts that reference them.",
  refs: [{ t: 'Dimensional modeling: dimension tables', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/dimensional-modeling-dimension-tables' }]
},
{
  id: 'c1-10', s: 'batch', case: 'c1', type: 'dropdown',
  stem: "You need to build the silver sales table in a notebook. The DataFrame `bronze` contains all sales rows. How should you complete the PySpark code?",
  code:
`from pyspark.sql import Window
from pyspark.sql.functions import row_number, rank, col

w = Window.partitionBy("[[0]]").orderBy(col("ModifiedAt").[[1]]())

silver = (bronze
    .withColumn("rn", [[2]]().over(w))
    .filter("rn = 1")
    .drop("rn"))`,
  blanks: [
    { options: ['TransactionID', 'ModifiedAt', 'StoreID'], answer: 0 },
    { options: ['desc', 'asc'], answer: 0 },
    { options: ['row_number', 'rank'], answer: 0 },
  ],
  explain: "Partition by the key you want to be unique (`TransactionID`) and sort each partition newest first (`desc`), so row 1 is the latest version.\n\nUse `row_number()`, which always numbers rows 1, 2, 3 even when two rows have the same `ModifiedAt`. `rank()` gives tied rows the same rank, so two rows could both get 1 and the duplicate would survive.",
  refs: [{ t: 'PySpark row_number', u: 'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.functions.row_number.html' }]
},

// ---------------- Case 2: Nordvik Energi ----------------
{
  id: 'c2-01', s: 'stream', case: 'c2', type: 'statements',
  stem: "You plan to use a single eventstream with an Azure IoT Hub source to meet the telemetry requirements.",
  statements: [
    { text: "The eventstream can send the same events to both an eventhouse destination and a lakehouse destination.", answer: true },
    { text: "To keep test events out of LH_Ops only, you should add a Filter operation on the path to the lakehouse destination.", answer: true },
    { text: "Writing the events to LH_Ops as Delta tables requires a Spark structured streaming notebook.", answer: false },
  ],
  explain: "An eventstream can route one source to several destinations, and each path can have its own transformations. A Filter on the lakehouse path removes `Status = 'Test'` events from LH_Ops while the eventhouse path still receives every event.\n\nThe eventstream **lakehouse destination** writes Delta tables for you, so no Spark code is needed. That meets the 'minimal development effort' requirement.",
  refs: [{ t: 'Process events with the event processor', u: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/event-streams/process-events-using-event-processor-editor' }, { t: 'Add a lakehouse destination', u: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/event-streams/add-destination-lakehouse' }]
},
{
  id: 'c2-02', s: 'stream', case: 'c2', type: 'dropdown',
  stem: "You need a KQL query for the operations dashboard. How should you complete the query?",
  code:
`Telemetry
| where Timestamp > ago(1h)
| summarize AvgPower = [[0]](PowerKW)
    by TurbineId, [[1]](Timestamp, 5m)
| render timechart`,
  blanks: [
    { options: ['avg', 'sum', 'max', 'dcount'], answer: 0 },
    { options: ['bin', 'startofday', 'round', 'ago'], answer: 0 },
  ],
  explain: "`avg()` gives the average power. `bin(Timestamp, 5m)` rounds each timestamp down to the start of its 5-minute bucket, which creates fixed, non-overlapping (tumbling) windows for `summarize`.\n\n`startofday` would bucket by day. `round` does not take a timespan bin size. `ago` returns a point in time, not a bucket.",
  refs: [{ t: 'bin()', u: 'https://learn.microsoft.com/en-us/kusto/query/bin-function' }]
},
{
  id: 'c2-03', s: 'stream', case: 'c2', type: 'single',
  stem: "You need to build the chart that shows, every minute, each turbine's average power over the previous 5 minutes by using an eventstream Group by operation. Which window type should you use?",
  options: ['Hopping', 'Tumbling', 'Session', 'Snapshot'],
  answer: 0,
  explain: "A **hopping** window has a fixed size (5 minutes) and moves forward by a hop that is smaller than the size (1 minute), so windows overlap and each event counts in several windows.\n\nA **tumbling** window would produce one result per 5 minutes with no overlap. **Session** windows group events separated by gaps of inactivity. **Snapshot** windows group events that have the same timestamp.",
  refs: [{ t: 'Eventstream Group by and windowing', u: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/event-streams/process-events-using-event-processor-editor' }]
},
{
  id: 'c2-04', s: 'mon', case: 'c2', type: 'single',
  stem: "You need to meet the requirement for the maintenance team's Teams message. What should you use?",
  options: [
    "An Activator destination on the eventstream with a rule on `RotorRPM` and a Teams action",
    "The Monitoring hub with an alert on the eventstream",
    "The Microsoft Fabric Capacity Metrics app",
    "A pipeline that queries the eventhouse every minute and has a Teams activity",
  ],
  answer: 0,
  explain: "**Activator** (formerly Data Activator) watches streaming data and fires actions such as Teams messages or emails when a condition is met, with no code. An eventstream can send events straight to an Activator item.\n\nThe Monitoring hub shows item runs; it does not evaluate data values. The Capacity Metrics app shows capacity usage. A polling pipeline adds latency, uses capacity and is more work.",
  refs: [{ t: 'What is Activator?', u: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/data-activator/activator-introduction' }]
},
{
  id: 'c2-05', s: 'load', case: 'c2', type: 'order',
  stem: "You need to build the nightly maintenance pipeline for one MaintDB table. Which four actions should you perform in sequence?",
  options: [
    "Lookup the last stored watermark value from a control table",
    "Lookup the current maximum `LastUpdated` value in the source table",
    "Copy rows where `LastUpdated` is greater than the old watermark and less than or equal to the new one, by using the gateway connection",
    "Update the control table with the new watermark value",
    "Truncate the destination table",
    "Copy all rows from the source table",
  ],
  answer: [0, 1, 2, 3],
  explain: "This is the classic **watermark** pattern. Read the old high-water mark and the source's current maximum, copy only rows between them, and save the new mark only after the copy succeeds. Capturing the upper bound first means rows that arrive during the copy are not skipped next time.\n\nTruncating or copying all rows would be a full load, which the requirement rules out. Because MaintDB is on-premises, the Copy activity uses a connection through the on-premises data gateway.",
  refs: [{ t: 'Incremental copy with a watermark', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/tutorial-incremental-copy-data-warehouse-lakehouse' }]
},
{
  id: 'c2-06', s: 'orch', case: 'c2', type: 'single',
  stem: "You need to meet the requirement for PL_Weather with the least effort. What should you do?",
  options: [
    "Set **Retry** on the activity that calls the API, with a retry interval",
    "Wrap the activity in an Until activity that loops until the call succeeds",
    "Schedule PL_Weather to run every 10 minutes instead of hourly",
    "Add a Fail activity on the failure path of the API activity",
  ],
  answer: 0,
  explain: "Every pipeline activity has **Retry** and **Retry interval** settings on its General tab. That is the built-in way to handle transient errors such as HTTP 503.\n\nAn Until loop works but takes more effort and more expressions. Running more often doesn't retry the failed call and wastes capacity. A Fail activity only marks the run as failed.",
  refs: [{ t: 'Activity overview', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/activity-overview' }]
},
{
  id: 'c2-07', s: 'opt', case: 'c2', type: 'dropdown',
  stem: "You need to configure the `Telemetry` table to meet the query and retention requirements. How should you complete the management commands?",
  code:
`.alter table Telemetry policy [[0]] hot = 7d

.alter-merge table Telemetry policy [[1]] softdelete = 365d`,
  blanks: [
    { options: ['caching', 'retention', 'partitioning', 'merge'], answer: 0 },
    { options: ['retention', 'caching', 'ingestionbatching', 'update'], answer: 0 },
  ],
  explain: "The **caching** policy keeps the most recent data (here 7 days) in hot cache on local SSD, which makes queries on it fast. The **retention** policy's soft-delete period controls how long data is kept at all (here one year). Older data stays queryable from cold storage, just more slowly.",
  refs: [{ t: 'Caching policy', u: 'https://learn.microsoft.com/en-us/kusto/management/cache-policy' }, { t: 'Retention policy', u: 'https://learn.microsoft.com/en-us/kusto/management/retention-policy' }]
},
{
  id: 'c2-08', s: 'mon', case: 'c2', type: 'statements',
  stem: "You are evaluating ways to notify the on-call engineer when the nightly maintenance pipeline fails.",
  statements: [
    { text: "An Office 365 Outlook activity connected to an activity with an **On fail** dependency runs when that activity fails.", answer: true },
    { text: "Fabric job events in the Real-Time hub can trigger an Activator alert when a pipeline run fails.", answer: true },
    { text: "The Microsoft Fabric Capacity Metrics app shows the error message of a failed pipeline activity.", answer: false },
  ],
  explain: "Inside a pipeline, an **On fail** dependency runs the next activity only when the upstream activity fails. That is a common way to send email or Teams notifications.\n\nOutside the pipeline, the Real-Time hub publishes **Fabric job events**, such as a job failing. You can route those to Activator for alerts.\n\nThe Capacity Metrics app shows compute consumption and throttling, not activity error details. Use the run details in the Monitoring hub for errors.",
  refs: [{ t: 'Office 365 Outlook activity', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/outlook-activity' }, { t: 'Fabric job events', u: 'https://learn.microsoft.com/en-us/fabric/real-time-hub/explore-fabric-job-events' }]
}
);
