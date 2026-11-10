// Domain 3: Monitor and optimize an analytics solution
DP700.questions.push(
// ---------- Monitoring ----------
{
  id: 'd3-01', s: 'mon', type: 'single',
  stem: "You need one place to see recent runs of pipelines, notebooks, Spark job definitions and dataflows across all the workspaces you can access, filtered by status. What should you use?",
  options: ['The Monitoring hub', 'The Microsoft Fabric Capacity Metrics app', 'The Admin monitoring workspace', 'The Spark history server'],
  answer: 0,
  explain: "The **Monitoring hub** lists activities for Fabric items you have access to, with filters for status, item type, time and more, and links to run details. The Capacity Metrics app shows compute use. The admin monitoring workspace is for tenant admins. The Spark history server covers one Spark application.",
  refs: [{ t: 'Monitoring hub', u: 'https://learn.microsoft.com/en-us/fabric/admin/monitoring-hub' }]
},
{
  id: 'd3-02', s: 'mon', type: 'single',
  stem: "Users report that everything slowed down at 09:00. You need to see which items used the most capacity units and whether the capacity was throttled. What should you use?",
  options: ['The Microsoft Fabric Capacity Metrics app', 'The Monitoring hub', 'Query insights in the warehouse', 'The eventstream data preview'],
  answer: 0,
  explain: "The **Capacity Metrics app** breaks down CU consumption by item and operation over time and shows overload, smoothing and throttling. The Monitoring hub shows runs but not capacity pressure. Query insights covers only one warehouse.",
  refs: [{ t: 'Capacity Metrics app', u: 'https://learn.microsoft.com/en-us/fabric/enterprise/metrics-app' }]
},
{
  id: 'd3-03', s: 'mon', type: 'single',
  stem: "A Copy activity is slower than expected. You need to see the rows read and written, the throughput and how long each stage took. Where should you look?",
  options: [
    "The Copy activity's run details (the details view in the pipeline run output)",
    "The Capacity Metrics app",
    "The lakehouse's table maintenance history",
    "The Git integration panel",
  ],
  answer: 0,
  explain: "The Copy activity's **details** in the pipeline run show data read and written, rows, throughput, parallelism and a breakdown of time spent per stage (queue, transfer and so on). That's the place to find the bottleneck.",
  refs: [{ t: 'Monitor pipeline runs', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/monitor-pipeline-runs' }]
},
{
  id: 'd3-04', s: 'mon', type: 'single',
  stem: "A Direct Lake semantic model must show new data soon after a notebook writes to the underlying Delta tables, without a scheduled refresh. What should you check?",
  options: [
    "That **Keep your Direct Lake data up to date** is enabled in the semantic model settings",
    "That V-Order is disabled on the tables",
    "That the semantic model is in Import mode",
    "That the notebook calls `notebookutils.notebook.exit()`",
  ],
  answer: 0,
  explain: "Direct Lake models are 'framed' to a version of the Delta tables. With **automatic updates** enabled, the model reframes when the underlying data changes, so no scheduled refresh is needed. You can also trigger a refresh from a pipeline with the semantic model refresh activity.\n\nImport mode would need scheduled refreshes. V-Order improves Direct Lake read performance; disabling it doesn't help freshness.",
  refs: [{ t: 'Direct Lake overview', u: 'https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-overview' }]
},
{
  id: 'd3-05', s: 'mon', type: 'single',
  stem: "A scheduled semantic model refresh failed overnight. Where can you see the error details for that refresh?",
  options: [
    "The refresh history of the semantic model (also reachable from the Monitoring hub)",
    "The deployment pipeline compare view",
    "The lakehouse SQL analytics endpoint",
    "The Real-Time hub",
  ],
  answer: 0,
  explain: "Each semantic model keeps a **refresh history** with start and end times, status and error messages. Refresh runs also show in the Monitoring hub. In a pipeline, the semantic model refresh activity output also reports failures.",
  refs: [{ t: 'Monitoring hub', u: 'https://learn.microsoft.com/en-us/fabric/admin/monitoring-hub' }]
},
{
  id: 'd3-06', s: 'mon', type: 'single',
  stem: "A Spark notebook run took much longer than usual. You suspect one stage had a few tasks processing far more data than the others. What should you use to confirm this?",
  options: ['The Spark UI or Spark history server for that application', 'The Capacity Metrics app', 'The Monitoring hub list view', 'Query insights'],
  answer: 0,
  explain: "The **Spark UI / history server**, reached from the run details, shows stages, task durations and input sizes, so skew stands out as a few long-running tasks. The other tools don't show task-level data.",
  refs: [{ t: 'Spark application detail monitoring', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/spark-detail-monitoring' }]
},
{
  id: 'd3-07', s: 'mon', type: 'single',
  stem: "You need to find the 10 slowest queries run against a warehouse in the last 30 days, with their text and duration. What should you query?",
  options: ['The `queryinsights.long_running_queries` view', '`sys.dm_exec_sessions` only', 'The Capacity Metrics app', 'The Monitoring hub'],
  answer: 0,
  explain: "**Query insights** keeps 30 days of completed query history in the `queryinsights` schema. `long_running_queries` aggregates by query shape with median and total time, and `exec_requests_history` lists individual executions. DMVs show only what is running now.",
  refs: [{ t: 'Query insights', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/query-insights' }]
},
{
  id: 'd3-08', s: 'mon', type: 'single',
  stem: "You want to analyse the query and ingestion logs of an eventhouse in the workspace with KQL over the last few weeks. What should you enable?",
  options: ['Workspace monitoring', 'Git integration', 'The OneLake shortcut cache', 'High concurrency mode'],
  answer: 0,
  explain: "**Workspace monitoring** creates a monitoring eventhouse in the workspace that collects logs and metrics from items such as eventhouses and semantic models, which you can query with KQL or build dashboards on.",
  refs: [{ t: 'Workspace monitoring', u: 'https://learn.microsoft.com/en-us/fabric/fundamentals/workspace-monitoring-overview' }]
},
{
  id: 'd3-09', s: 'mon', type: 'single',
  stem: "A sales manager wants an email whenever the daily revenue shown in a Power BI card visual drops below 50,000. What should you use?",
  options: ['Set an alert on the visual, which creates an Activator rule', 'The Monitoring hub', 'A deployment pipeline rule', 'A KQL update policy'],
  answer: 0,
  explain: "Power BI visuals can **Set alert**, which creates an **Activator** rule that checks the value and sends email or Teams messages when the condition is met. None of the other options react to data values.",
  refs: [{ t: 'What is Activator?', u: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/data-activator/activator-introduction' }]
},
{
  id: 'd3-10', s: 'mon', type: 'statements',
  stem: "You are using the Monitoring hub.",
  statements: [
    { text: "It shows activities only for items in workspaces you have access to.", answer: true },
    { text: "You can open run details from the hub to investigate a failure.", answer: true },
    { text: "It keeps run history indefinitely.", answer: false },
  ],
  explain: "The Monitoring hub respects your permissions and links to each item's run details. Its history is limited to a rolling window, roughly the last 30 days. For long-term analysis, use workspace monitoring or export the data.",
  refs: [{ t: 'Monitoring hub', u: 'https://learn.microsoft.com/en-us/fabric/admin/monitoring-hub' }]
},

// ---------- Errors ----------
{
  id: 'd3-11', s: 'err', type: 'single',
  stem: "A source system added a new column. A notebook that appends to a Delta table now fails with a schema mismatch error. The new column must be added to the table. What should you do?",
  options: [
    "Add `.option('mergeSchema', 'true')` to the write",
    "Add `.option('overwriteSchema', 'true')` and keep append mode",
    "Run VACUUM on the table",
    "Cast the new column to string",
  ],
  answer: 0,
  explain: "**mergeSchema** lets a write add new columns to the table schema. **overwriteSchema** replaces the whole schema and only applies when you overwrite the data. VACUUM and casting don't add the column.",
  refs: [{ t: 'Delta schema evolution', u: 'https://docs.delta.io/latest/delta-batch.html#automatic-schema-update' }]
},
{
  id: 'd3-12', s: 'err', type: 'single',
  stem: "A notebook reads `spark.read.table('sales')` and writes to `Tables/sales_clean`. It works for its author but fails with 'table or view not found' after it was imported into a new workspace. What is the most likely cause?",
  options: [
    "The notebook has no default lakehouse in the new workspace",
    "V-Order is disabled",
    "The capacity is paused",
    "High concurrency mode is off",
  ],
  answer: 0,
  explain: "Unqualified table names and relative paths such as `Tables/...` resolve against the notebook's **default lakehouse**. An imported notebook may have none, or point at a lakehouse it can't reach. Attach the right lakehouse or use fully qualified names and paths.\n\nA paused capacity would stop the notebook from running at all.",
  refs: [{ t: 'Use notebooks with a lakehouse', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-notebook-explore' }]
},
{
  id: 'd3-13', s: 'err', type: 'single',
  stem: "During a busy period, starting an interactive notebook fails with HTTP 430 'TooManyRequestsForCapacity'. Scheduled notebooks run from pipelines are still running, just later than usual. What explains this?",
  options: [
    "The capacity has hit its Spark concurrency limit. Interactive jobs are rejected, while pipeline and scheduled jobs are queued",
    "The notebook has a syntax error",
    "The workspace Git connection is broken",
    "The lakehouse is in a different region",
  ],
  answer: 0,
  explain: "Each capacity SKU allows a set number of Spark VCores (with bursting). When the limit is reached, **interactive** requests get a 430 error, while **job** requests from pipelines, the scheduler and Spark job definitions are **queued** and run when cores free up. Fixes: wait, cancel idle sessions, use a bigger capacity or spread the workload over time.",
  refs: [{ t: 'Job concurrency and queueing', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/spark-job-concurrency-and-queueing' }]
},
{
  id: 'd3-14', s: 'err', type: 'single',
  stem: "A notebook fails with a driver out-of-memory error on the line `pdf = df.toPandas()`, where `df` has 400 million rows. What should you do?",
  options: [
    "Keep the processing in Spark and write the result with Spark instead of collecting it to the driver",
    "Increase the number of executors",
    "Run `OPTIMIZE` on the source table",
    "Enable high concurrency mode",
  ],
  answer: 0,
  explain: "`toPandas()` and `collect()` pull **all the data to the driver**. Adding executors doesn't help, because the driver is the bottleneck. Keep the work distributed in Spark, or use the pandas API on Spark. Collect only small results.",
  refs: [{ t: 'Spark compute', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/spark-compute' }]
},
{
  id: 'd3-15', s: 'err', type: 'single',
  stem: "A Lookup activity that reads a list of 12,000 file names fails because its output is too large. What should you do?",
  options: [
    "Split the list into smaller chunks (for example with a paged query) or move the logic into a notebook, because Lookup is limited to 5,000 rows and 4 MB",
    "Select First row only",
    "Increase the activity timeout",
    "Set the ForEach batch count to 50",
  ],
  answer: 0,
  explain: "The Lookup activity returns at most **5,000 rows and 4 MB**. Larger lists have to be paged, for example with an outer loop over ranges, or handled in a notebook. First row only would return one file. A longer timeout doesn't raise the size limit.",
  refs: [{ t: 'Lookup activity', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/lookup-activity' }]
},
{
  id: 'd3-16', s: 'err', type: 'single',
  stem: "A Copy activity loading CSV files fails because a few rows have text in a numeric column. The load must continue and the bad rows must be kept for review. What should you configure?",
  options: [
    "Fault tolerance to skip incompatible rows, with session logging to a storage location",
    "Retry set to 3",
    "Staging enabled",
    "A higher degree of copy parallelism",
  ],
  answer: 0,
  explain: "Copy activity **fault tolerance** can skip incompatible rows, and **session logging** writes the skipped rows and reasons to storage so you can review them. Retries just repeat the same failure. Staging and parallelism affect performance, not data errors.",
  refs: [{ t: 'Copy activity settings', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/copy-data-activity' }, { t: 'Fault tolerance (Data Factory)', u: 'https://learn.microsoft.com/en-us/azure/data-factory/copy-activity-fault-tolerance' }]
},
{
  id: 'd3-17', s: 'err', type: 'single',
  stem: "A Notebook activity in a pipeline failed. You need to see which cell failed and its error output. What should you do?",
  options: [
    "Open the Notebook activity's run details from the pipeline run and view the notebook snapshot",
    "Open the notebook in the editor; the last run's outputs are always shown",
    "Check the Capacity Metrics app",
    "Rerun the pipeline in debug mode with logging off",
  ],
  answer: 0,
  explain: "Pipeline notebook runs keep a **snapshot**: the notebook code with each cell's output and error as they were for that run. You reach it from the activity's run details or the Monitoring hub. The editor shows your interactive session, not the pipeline's run.",
  refs: [{ t: 'Notebook activity', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/notebook-activity' }]
},
{
  id: 'd3-18', s: 'err', type: 'single',
  stem: "A Dataflow Gen2 refresh fails with a 'couldn't convert to Number' error in the `Quantity` column. Some source rows contain `n/a`. The rest of the data must still load. What should you do in Power Query?",
  options: [
    "Use Replace errors (or Remove errors) on `Quantity` after the type change",
    "Change the destination to Append",
    "Disable staging",
    "Increase the refresh timeout",
  ],
  answer: 0,
  explain: "The type conversion produces **cell-level errors** for rows such as `n/a`. **Replace errors** swaps them for a value such as null or 0, and **Remove errors** drops those rows. You can also use Keep errors first to inspect them. Destination and staging settings don't fix bad values.",
  refs: [{ t: 'Dealing with errors in Power Query', u: 'https://learn.microsoft.com/en-us/power-query/dealing-with-errors' }]
},
{
  id: 'd3-19', s: 'err', type: 'single',
  stem: "A Dataflow Gen2 with ten queries failed. You need to find which query or destination caused the failure. Where should you look?",
  options: [
    "The dataflow's refresh history, then the failed run's per-activity details",
    "The lakehouse table properties",
    "The workspace Git status",
    "The eventstream runtime logs",
  ],
  answer: 0,
  explain: "The **refresh history** of a Dataflow Gen2 lists each run. Opening a run shows the status, duration and error message for each query and destination write, which points straight at the failing step.",
  refs: [{ t: 'Dataflow Gen2 refresh history', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/dataflows-gen2-monitor' }]
},
{
  id: 'd3-20', s: 'err', type: 'single',
  stem: "Some data sent to a KQL table never arrives, and you suspect ingestion errors. Which command should you run to investigate?",
  options: ['`.show ingestion failures`', '`.show table Telemetry policy caching`', '`.show queries`', '`.show materialized-views`'],
  answer: 0,
  explain: "`.show ingestion failures` lists failed ingestion operations with the table, error code and details, for example mapping or format errors. The other commands show policies, queries and views.",
  refs: [{ t: '.show ingestion failures', u: 'https://learn.microsoft.com/en-us/kusto/management/ingestion-failures' }]
},
{
  id: 'd3-21', s: 'err', type: 'single',
  stem: "A KQL query fails with an error that the result set exceeded the record count limit. What is the best fix?",
  options: [
    "Filter or aggregate the data so the result is smaller",
    "Add `set notruncation;` to every dashboard query",
    "Increase the caching policy",
    "Create a shortcut to the table",
  ],
  answer: 0,
  explain: "By default, results are truncated at **500,000 records or 64 MB**. The right fix is to return less: filter, summarize or project fewer columns. `notruncation` removes the safety limit and can overload clients, so use it only for deliberate exports.",
  refs: [{ t: 'Query limits', u: 'https://learn.microsoft.com/en-us/kusto/concepts/query-limits' }]
},
{
  id: 'd3-22', s: 'err', type: 'single',
  stem: "An upstream team renamed the JSON property `temp` to `temperature`. Events still reach the eventhouse table, but the `Temperature` column is now always empty. What should you fix?",
  options: [
    "The table's JSON ingestion mapping, so that `$.temperature` maps to `Temperature`",
    "The caching policy",
    "The retention policy",
    "The materialized view",
  ],
  answer: 0,
  explain: "The **ingestion mapping** maps JSON paths to columns. When a property is renamed, the old path finds nothing and the column is ingested empty. Update the mapping to the new path.",
  refs: [{ t: 'Ingestion mappings', u: 'https://learn.microsoft.com/en-us/kusto/management/mappings' }]
},
{
  id: 'd3-23', s: 'err', type: 'single',
  stem: "An eventstream's lakehouse destination shows a warning icon, and some events aren't written. Where can you see the warning and error messages for that node?",
  options: [
    "Select the destination node and open its **Runtime logs** (and Data insights) in the eventstream editor",
    "The Monitoring hub's Spark applications list",
    "The Capacity Metrics app",
    "The lakehouse table maintenance dialog",
  ],
  answer: 0,
  explain: "Each eventstream node has **Data insights** (event metrics) and **Runtime logs** (warnings and errors such as serialization or schema problems) at the bottom of the editor. That's the first place to diagnose source or destination issues.",
  refs: [{ t: 'Monitor eventstreams', u: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/event-streams/monitor' }]
},
{
  id: 'd3-24', s: 'err', type: 'single',
  stem: "A `CREATE TABLE` statement that was moved from SQL Server fails in a Fabric warehouse because of the column `OrderDate datetime`. What should you change it to?",
  options: ['`datetime2(6)`', '`datetimeoffset`', '`smalldatetime`', '`timestamp`'],
  answer: 0,
  explain: "Fabric Data Warehouse supports a subset of SQL Server types. `datetime` and `smalldatetime` aren't supported; use **`datetime2`**, whose precision is limited to 6 fractional digits. `timestamp` in T-SQL is a rowversion, not a date.",
  refs: [{ t: 'Warehouse data types', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/data-types' }]
},
{
  id: 'd3-25', s: 'err', type: 'single',
  stem: "Two pipelines run at the same time and both execute `UPDATE dbo.FactSales ...` on different rows. One of them fails with 'Snapshot isolation transaction aborted due to update conflict'. What should you do?",
  options: [
    "Make the two updates run one after the other (or add retry logic), because conflicts are detected at table level",
    "Add row-level locking hints",
    "Switch the warehouse to read committed isolation",
    "Partition the table by date",
  ],
  answer: 0,
  explain: "Fabric warehouses use **snapshot isolation**, and write–write conflicts are detected at the **table** level. Two concurrent transactions that modify the same table conflict even when they touch different rows. Serialize the writers or retry. Locking hints and other isolation levels aren't options here.",
  refs: [{ t: 'Transactions in Fabric warehouse', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/transactions' }]
},
{
  id: 'd3-26', s: 'err', type: 'single',
  stem: "A notebook just created a new Delta table in a lakehouse, but the table isn't visible yet when you query the SQL analytics endpoint. What is the most likely reason?",
  options: [
    "The SQL analytics endpoint metadata hasn't synchronized yet; refresh it or wait for the sync",
    "The table must be created with T-SQL to be visible",
    "Viewers can never see new tables",
    "V-Order must be enabled for tables to appear",
  ],
  answer: 0,
  explain: "The SQL analytics endpoint detects Delta tables through a **metadata sync**, which usually takes seconds but can lag. You can trigger a refresh of the metadata. Only Delta-format tables appear; plain Parquet or CSV files in Tables don't. V-Order isn't required.",
  refs: [{ t: 'SQL analytics endpoint performance', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/sql-analytics-endpoint-performance' }]
},
{
  id: 'd3-27', s: 'err', type: 'single',
  stem: "A Delta MERGE fails with 'multiple source rows matched and attempted to modify the same target row'. What should you do?",
  options: [
    "Deduplicate the source on the merge key (for example keep the latest row per key) before the merge",
    "Add `mergeSchema` to the merge",
    "Run OPTIMIZE on the target",
    "Change the merge condition to `1 = 1`",
  ],
  answer: 0,
  explain: "MERGE requires **at most one source row per target row**. If the batch contains the same key twice, pick one first, for example with `row_number()` over the key ordered by a timestamp. Schema options and OPTIMIZE don't address duplicates.",
  refs: [{ t: 'Delta Lake merge', u: 'https://docs.delta.io/latest/delta-update.html#upsert-into-a-table-using-merge' }]
},

// ---------- Optimize ----------
{
  id: 'd3-28', s: 'opt', type: 'single',
  stem: "A Delta table receives small appends every few minutes and now has tens of thousands of small Parquet files. Reads have become slow. What should you run?",
  options: ['`OPTIMIZE`', '`VACUUM`', '`ANALYZE TABLE`', '`REFRESH TABLE`'],
  answer: 0,
  explain: "`OPTIMIZE` performs **bin-compaction**, rewriting many small files into fewer large ones. That's the fix for the small-file problem. `VACUUM` deletes old unreferenced files but doesn't compact. You can run both from the lakehouse's table maintenance feature.",
  refs: [{ t: 'Delta table maintenance', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-table-maintenance' }]
},
{
  id: 'd3-29', s: 'opt', type: 'single',
  stem: "Most queries on a 3 TB Delta table filter on `CustomerID`, which has millions of distinct values. You need to improve data skipping. What should you do?",
  options: [
    "`OPTIMIZE sales ZORDER BY (CustomerID)`",
    "Partition the table by `CustomerID`",
    "Run `VACUUM sales RETAIN 0 HOURS`",
    "Convert the table to CSV",
  ],
  answer: 0,
  explain: "**Z-ordering** places rows with similar values in the same files, so min/max statistics let readers skip files for high-cardinality filters. Partitioning on a column with millions of values creates millions of tiny folders. `RETAIN 0 HOURS` is dangerous: it breaks time travel and can break concurrent readers.",
  refs: [{ t: 'Delta optimization and V-Order', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/delta-optimization-and-v-order' }]
},
{
  id: 'd3-30', s: 'opt', type: 'statements',
  stem: "You are evaluating V-Order for lakehouse tables.",
  statements: [
    { text: "V-Order is a write-time optimization, and the files remain standard Parquet that any engine can read.", answer: true },
    { text: "V-Order mainly benefits read-heavy workloads such as Direct Lake semantic models and the SQL analytics endpoint.", answer: true },
    { text: "V-Order makes writes faster.", answer: false },
  ],
  explain: "V-Order applies special sorting, row-group distribution and compression when **writing** Parquet, and the result is still open Parquet. It speeds up reads, especially Power BI Direct Lake, at the cost of **slower writes**. That's why write-heavy workloads often leave it off.",
  refs: [{ t: 'Delta optimization and V-Order', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/delta-optimization-and-v-order' }]
},
{
  id: 'd3-31', s: 'opt', type: 'single',
  stem: "What does running `VACUUM` with the default retention on a Delta table do?",
  options: [
    "Deletes data files no longer referenced by the table and older than 7 days",
    "Compacts small files into larger ones",
    "Deletes table versions newer than 7 days",
    "Rebuilds column statistics",
  ],
  answer: 0,
  explain: "VACUUM removes files that are **no longer referenced** by the current table version and are older than the retention threshold (7 days by default). This saves storage but limits time travel to the retention period. It doesn't compact files or touch statistics.",
  refs: [{ t: 'Delta table maintenance', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-table-maintenance' }]
},
{
  id: 'd3-32', s: 'opt', type: 'single',
  stem: "A 2 TB Delta table of orders is almost always filtered by year and month, and each month holds about 20 GB. Which partitioning strategy is best?",
  options: [
    "Partition by a year–month column",
    "Partition by `OrderID`",
    "Partition by `OrderTimestamp` to the second",
    "Partition by `CustomerID`",
  ],
  answer: 0,
  explain: "Good partition columns are **low cardinality**, frequently filtered, and give partitions of at least about 1 GB. Year–month meets all three. IDs and timestamps create huge numbers of tiny partitions and small files, which hurts performance.",
  refs: [{ t: 'Delta optimization and V-Order', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/delta-optimization-and-v-order' }]
},
{
  id: 'd3-33', s: 'opt', type: 'single',
  stem: "A workspace runs heavy ETL that mostly writes data, and Power BI isn't used on these tables. Which Spark resource profile should you configure?",
  options: ['writeHeavy', 'readHeavyForPBI', 'readHeavyForSpark', 'custom with V-Order forced on'],
  answer: 0,
  explain: "Fabric Spark **resource profiles** bundle settings for a workload type. **writeHeavy** tunes for ingestion and ETL throughput (for example with V-Order off). **readHeavyForPBI** suits Direct Lake reporting tables and **readHeavyForSpark** suits interactive Spark reads. Forcing V-Order on would slow the writes down.",
  refs: [{ t: 'Resource profile configurations', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/configure-resource-profile-configurations' }]
},
{
  id: 'd3-34', s: 'opt', type: 'single',
  stem: "A Spark job writes a partitioned Delta table, and each run produces hundreds of tiny files per partition. You want fewer, larger files at write time without a separate maintenance job. What should you enable?",
  options: ['Optimize write', 'VACUUM', 'Z-order', 'Autoscale'],
  answer: 0,
  explain: "**Optimize write** reshuffles data before writing so each partition gets fewer, larger files, which helps most with partitioned tables. Z-order and OPTIMIZE run **after** the data is written. VACUUM deletes old files. Autoscale changes the cluster size.",
  refs: [{ t: 'Delta optimization and V-Order', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/delta-optimization-and-v-order' }]
},
{
  id: 'd3-35', s: 'opt', type: 'single',
  stem: "A ForEach activity copies 120 independent tables, but **Sequential** is selected and the pipeline takes four hours. The source can handle more parallel load. What should you do?",
  options: [
    "Clear Sequential and set a batch count (up to 50) that the source can handle",
    "Add a Wait activity between iterations",
    "Increase the Copy activity retry count",
    "Split the pipeline into 120 pipelines with their own schedules",
  ],
  answer: 0,
  explain: "Running ForEach in parallel with a sensible **batch count** (the maximum is 50) processes many tables at once. 120 separate pipelines would be unmanageable. Waits and retries add time.",
  refs: [{ t: 'ForEach activity', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/foreach-activity' }]
},
{
  id: 'd3-36', s: 'opt', type: 'single',
  stem: "A Copy activity moves one 500-million-row table from Azure SQL Database. It reads the table in a single stream and is slow. What should you configure?",
  options: [
    "A source partition option (such as dynamic range on a numeric key) and a higher degree of copy parallelism",
    "Fault tolerance",
    "Session logging",
    "A smaller batch count on the parent ForEach",
  ],
  answer: 0,
  explain: "With **partitioned reads** (physical partitions or dynamic range), Copy can read the table in parallel streams. Together with **parallel copies** and enough intelligent throughput optimization, this greatly increases throughput. Fault tolerance and logging are about errors, not speed.",
  refs: [{ t: 'Copy activity performance', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/copy-activity-performance-and-scalability-guide' }]
},
{
  id: 'd3-37', s: 'opt', type: 'single',
  stem: "After a large nightly load into a warehouse, some queries choose poor plans until later in the day. What should you do as part of the load?",
  options: [
    "Update statistics on the affected columns (`UPDATE STATISTICS`) after the load",
    "Run `VACUUM` on the warehouse tables",
    "Disable result set caching",
    "Convert the tables to views",
  ],
  answer: 0,
  explain: "The warehouse query optimizer relies on **statistics**. Fabric creates and updates them automatically, but after big data changes, refreshing them explicitly with `UPDATE STATISTICS` (or creating them on key join and filter columns) gives better plans straight away. VACUUM is a Delta Spark command, and the warehouse manages its own files.",
  refs: [{ t: 'Statistics in Fabric warehouse', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/statistics' }]
},
{
  id: 'd3-38', s: 'opt', type: 'single',
  stem: "An application inserts rows into a Fabric warehouse one at a time with thousands of `INSERT ... VALUES` statements per hour. Query performance on the table is getting worse. What should you recommend?",
  options: [
    "Batch the data and load it with `COPY INTO`, CTAS or `INSERT ... SELECT` in larger transactions",
    "Add more single-row inserts in parallel",
    "Disable statistics",
    "Use `nvarchar(max)` for every column",
  ],
  answer: 0,
  explain: "Every singleton insert creates small Parquet files and log overhead. Warehouses perform best with **bulk** operations such as `COPY INTO`, CTAS and `INSERT ... SELECT`, or a pipeline Copy activity. Stage trickle data and load it in batches.",
  refs: [{ t: 'Warehouse performance guidelines', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/guidelines-warehouse-performance' }]
},
{
  id: 'd3-39', s: 'opt', type: 'single',
  stem: "A warehouse table stores two-letter country codes in a `varchar(8000)` column. Which statement is true?",
  options: [
    "Oversized string columns can increase memory grants and slow queries; use the smallest type that fits, such as `char(2)` or `varchar(2)`",
    "Column size has no effect in Fabric, because storage is Parquet",
    "`varchar(8000)` is required for UTF-8 data",
    "Fabric automatically resizes the column after the load",
  ],
  answer: 0,
  explain: "Microsoft's warehouse guidance is to **choose the smallest data type** that fits. The engine estimates memory from declared sizes, so overly wide strings waste memory and can slow queries, even though the stored data is compressed.",
  refs: [{ t: 'Warehouse performance guidelines', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/guidelines-warehouse-performance' }]
},
{
  id: 'd3-40', s: 'opt', type: 'single',
  stem: "A Real-Time Dashboard tile runs the same hourly aggregation over a 5-billion-row KQL table every 30 seconds and is slow. What should you do?",
  options: [
    "Create a materialized view with the aggregation and query the view",
    "Increase the retention period",
    "Use `set notruncation`",
    "Move the table to a warehouse",
  ],
  answer: 0,
  explain: "A **materialized view** keeps the aggregation up to date incrementally, so the dashboard reads a small, already-aggregated result instead of scanning raw data every 30 seconds. Retention and truncation settings don't reduce the work.",
  refs: [{ t: 'Materialized views', u: 'https://learn.microsoft.com/en-us/kusto/management/materialized-views/materialized-view-overview' }]
},
{
  id: 'd3-41', s: 'opt', type: 'single',
  stem: "Data sent to an eventhouse table through queued ingestion takes several minutes to become queryable. Users need it within seconds. Which policy should you change?",
  options: [
    "The ingestion batching policy (or enable streaming ingestion on the table)",
    "The caching policy",
    "The retention policy",
    "The row-level security policy",
  ],
  answer: 0,
  explain: "Queued ingestion collects data into batches until a time, size or count limit is reached. Lowering those limits in the **ingestion batching policy** reduces latency, at the cost of more, smaller extents. **Streaming ingestion** gives the lowest latency for small, frequent writes. Caching and retention don't affect ingestion speed.",
  refs: [{ t: 'Ingestion batching policy', u: 'https://learn.microsoft.com/en-us/kusto/management/batching-policy' }]
},
{
  id: 'd3-42', s: 'opt', type: 'single',
  stem: "The first query each morning on an eventhouse is slow, because the eventhouse suspends when it isn't used overnight. Users need consistently fast responses. What should you configure?",
  options: [
    "Minimum consumption (always-on) for the eventhouse",
    "A longer retention period",
    "A deployment pipeline",
    "V-Order",
  ],
  answer: 0,
  explain: "Eventhouses can **auto-suspend** to save capacity. Setting **minimum consumption** keeps a guaranteed amount of compute running all the time, so queries never wait for a cold start, at the cost of continuous CU use.",
  refs: [{ t: 'Eventhouse overview', u: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/eventhouse' }]
},
{
  id: 'd3-43', s: 'opt', type: 'single',
  stem: "You want Spark SQL and DataFrame workloads to run faster without changing any code. What should you enable for the environment?",
  options: ['The native execution engine', 'High concurrency mode', 'The OneLake shortcut cache', 'Git integration'],
  answer: 0,
  explain: "The **native execution engine** runs supported Spark operators in vectorized C++ (based on Velox and Apache Gluten). It often speeds up queries considerably with no code changes, and falls back to standard Spark for unsupported operators. You enable it in an environment or per session.",
  refs: [{ t: 'Native execution engine', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/native-execution-engine-overview' }]
},
{
  id: 'd3-44', s: 'opt', type: 'single',
  stem: "A notebook joins a 2-billion-row fact DataFrame with a 300-row lookup DataFrame, and the join causes a large shuffle. What should you do?",
  options: [
    "Use a broadcast join: `fact.join(F.broadcast(lookup), 'Key')`",
    "Repartition both DataFrames to 1 partition",
    "Call `collect()` on the fact DataFrame first",
    "Convert both to pandas",
  ],
  answer: 0,
  explain: "**Broadcasting** sends the small table to every executor, so the big table doesn't have to be shuffled. Spark often does this automatically below a size threshold, but a hint makes it explicit. The other options would either crash the job or remove all parallelism.",
  refs: [{ t: 'Spark join hints', u: 'https://spark.apache.org/docs/latest/sql-ref-syntax-qry-select-hints.html' }]
},
{
  id: 'd3-45', s: 'opt', type: 'statements',
  stem: "You are tuning KQL queries.",
  statements: [
    { text: "For whole-term searches, `has` is usually faster than `contains`, because it uses the term index.", answer: true },
    { text: "Filtering on the datetime column early in the query helps the engine skip data.", answer: true },
    { text: "In a `join`, you should put the larger table on the left side.", answer: false },
  ],
  explain: "`has` looks up indexed terms, while `contains` scans for substrings. Time filters let the engine skip whole extents. For joins, the guidance is to put the **smaller** table on the **left**, or use hints such as `hint.strategy=broadcast` when the left side is small.",
  refs: [{ t: 'KQL best practices', u: 'https://learn.microsoft.com/en-us/kusto/query/best-practices' }]
},
{
  id: 'd3-46', s: 'opt', type: 'single',
  stem: "An eventstream that processes a high volume of events falls behind and its latency keeps growing. What should you adjust first?",
  options: [
    "The eventstream's event throughput setting, to a higher level",
    "The KQL retention policy",
    "The deployment pipeline rules",
    "The Spark starter pool size",
  ],
  answer: 0,
  explain: "Eventstreams have a configurable **event throughput** level that sets how much data they can ingest and process. Raising it adds processing capacity, at a higher CU cost. The other settings don't affect eventstream processing.",
  refs: [{ t: 'Eventstream settings', u: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/event-streams/configure-settings' }]
},
{
  id: 'd3-47', s: 'opt', type: 'single',
  stem: "A Dataflow Gen2 loads 20,000 rows from SharePoint into a lakehouse table. It runs slowly, and you notice staging is enabled for the query. What should you try first?",
  options: [
    "Disable staging for that query, so the data is written directly to the destination",
    "Enable staging for every query",
    "Add a Copy activity before the dataflow",
    "Enable V-Order on the lakehouse",
  ],
  answer: 0,
  explain: "**Staging** writes the data to a staging lakehouse and uses warehouse compute to transform it. That helps large volumes and folding-heavy transformations, but adds overhead for small data. For small loads, disabling staging is often faster and cheaper.",
  refs: [{ t: 'Dataflow Gen2 staging', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/dataflows-gen2-overview' }]
},

// ---------- Yes/No series: small files ----------
{
  id: 'd3-s3a', s: 'opt', type: 'single', series: 's3',
  stem: "**This question is part of a series that presents the same scenario. Each question has a unique solution. Determine whether the solution meets the goal.**\n\nThe lakehouse Delta table `sales` receives a small append every five minutes and has accumulated many small files. You need to reduce the number of files to improve read performance.\n\nSolution: You schedule `OPTIMIZE sales` to run nightly.\n\nDoes this meet the goal?",
  options: ['Yes', 'No'],
  answer: 0,
  explain: "**Yes.** OPTIMIZE compacts small files into larger ones. Running it regularly keeps the file count under control.",
  refs: [{ t: 'Delta table maintenance', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-table-maintenance' }]
},
{
  id: 'd3-s3b', s: 'opt', type: 'single', series: 's3',
  stem: "**This question is part of a series that presents the same scenario. Each question has a unique solution. Determine whether the solution meets the goal.**\n\nThe lakehouse Delta table `sales` receives a small append every five minutes and has accumulated many small files. You need to reduce the number of files to improve read performance.\n\nSolution: You schedule `VACUUM sales` with the default retention to run nightly.\n\nDoes this meet the goal?",
  options: ['Yes', 'No'],
  answer: 1,
  explain: "**No.** VACUUM deletes old files that the table no longer references. The current version still reads all of its small files, so performance doesn't improve.",
  refs: [{ t: 'Delta table maintenance', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-table-maintenance' }]
},
{
  id: 'd3-s3c', s: 'opt', type: 'single', series: 's3',
  stem: "**This question is part of a series that presents the same scenario. Each question has a unique solution. Determine whether the solution meets the goal.**\n\nThe lakehouse Delta table `sales` receives a small append every five minutes and has accumulated many small files. You need to reduce the number of files to improve read performance.\n\nSolution: You repartition the table by `TransactionID`.\n\nDoes this meet the goal?",
  options: ['Yes', 'No'],
  answer: 1,
  explain: "**No.** Partitioning by a unique ID creates a huge number of partitions with tiny files, which makes the problem far worse.",
  refs: [{ t: 'Delta optimization and V-Order', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/delta-optimization-and-v-order' }]
}
);
