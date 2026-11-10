// Domain 2: Ingest and transform data
DP700.questions.push(
// ---------- Loading patterns ----------
{
  id: 'd2-01', s: 'load', type: 'single',
  stem: "You are designing an incremental load from a source table. Rows are both inserted and updated. Which column is the best watermark?",
  options: [
    "`LastModifiedUtc`, which the application sets on every insert and update",
    "`OrderID`, an increasing identity column",
    "`OrderDate`, the date the order was placed",
    "`CustomerID`",
  ],
  answer: 0,
  explain: "A watermark must change whenever a row changes. An increasing ID or the order date catches **new** rows but misses updates to existing ones. A reliable last-modified timestamp catches both.\n\nIf the source has no such column, consider CDC or mirroring, or a full load for small tables.",
  refs: [{ t: 'Incremental copy pattern', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/tutorial-incremental-copy-data-warehouse-lakehouse' }]
},
{
  id: 'd2-02', s: 'load', type: 'order',
  stem: "You need to build a notebook that upserts changed customer rows from a bronze table into the Delta table `silver.customers`. Which four actions should you perform in sequence?",
  options: [
    "Read the last processed `ModifiedAt` value from a control table",
    "Read bronze rows with `ModifiedAt` greater than that value",
    "MERGE the rows into `silver.customers` on `CustomerID`",
    "Write the new maximum `ModifiedAt` to the control table",
    "Overwrite `silver.customers` with the bronze rows",
    "Run VACUUM on `silver.customers`",
  ],
  answer: [0, 1, 2, 3],
  explain: "Read the watermark, select only newer rows, **MERGE** them (updating matches and inserting new keys), and only then move the watermark forward. If the merge fails, the next run reprocesses the same rows.\n\nOverwriting would be a full load and would lose rows that aren't in this batch. VACUUM is housekeeping, not part of the load.",
  refs: [{ t: 'Delta Lake merge', u: 'https://docs.delta.io/latest/delta-update.html#upsert-into-a-table-using-merge' }]
},
{
  id: 'd2-03', s: 'load', type: 'dropdown',
  stem: "You need to upsert the DataFrame `updates` into `silver.customers`: update matching customers and insert new ones. How should you complete the code?",
  code:
`from delta.tables import DeltaTable

target = DeltaTable.forName(spark, "silver.customers")

(target.alias("t")
    .[[0]](updates.alias("s"), "t.CustomerID = s.CustomerID")
    .[[1]]()
    .[[2]]()
    .execute())`,
  blanks: [
    { options: ['merge', 'join', 'union', 'update'], answer: 0 },
    { options: ['whenMatchedUpdateAll', 'whenMatchedDelete', 'whenNotMatchedBySourceDelete'], answer: 0 },
    { options: ['whenNotMatchedInsertAll', 'whenMatchedUpdateAll', 'whenNotMatchedBySourceDelete'], answer: 0 },
  ],
  explain: "`DeltaTable.merge(source, condition)` starts a merge builder. `whenMatchedUpdateAll()` updates every column of matching rows and `whenNotMatchedInsertAll()` inserts source rows that have no match. `execute()` runs the merge.\n\n`whenNotMatchedBySourceDelete()` would delete target rows that are missing from the batch, which you don't want for an incremental batch.",
  refs: [{ t: 'Delta Lake merge', u: 'https://docs.delta.io/latest/delta-update.html#upsert-into-a-table-using-merge' }]
},
{
  id: 'd2-04', s: 'load', type: 'single',
  stem: "You need to copy 40 tables incrementally from an Azure SQL Database into a lakehouse every hour. Each table has a reliable last-modified column. You want the least development effort and no hand-built watermark logic. What should you use?",
  options: [
    "A Copy job with incremental copy",
    "A pipeline with Lookup, ForEach, Copy and Stored procedure activities",
    "A notebook for each table",
    "A Dataflow Gen2 with one query per table",
  ],
  answer: 0,
  explain: "A **Copy job** supports incremental copy natively. You choose an incremental column per table and Fabric keeps the watermark state. A pipeline works but you build and maintain the watermark logic yourself. Notebooks and dataflows mean even more custom work.",
  refs: [{ t: 'What is Copy job?', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/what-is-copy-job' }]
},
{
  id: 'd2-05', s: 'load', type: 'single',
  stem: "A source table of 8,000 store locations has no reliable change column. Rows can be updated or deleted at any time. What load pattern should you use?",
  options: [
    "A full load that overwrites the target table each run",
    "An incremental load on `StoreID`",
    "Append-only loading",
    "A streaming load with an eventstream",
  ],
  answer: 0,
  explain: "With no change column and a small table, a **full reload** is simple and correct: it picks up updates **and** deletes. An incremental load on an ID misses updates and deletes. Appending creates duplicates. Streaming is overkill for slowly changing reference data.",
  refs: [{ t: 'Data loading patterns', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/ingest-data' }]
},
{
  id: 'd2-06', s: 'load', type: 'statements',
  stem: "You are designing slowly changing dimensions (SCD).",
  statements: [
    { text: "A Type 1 dimension overwrites the changed attribute on the existing row.", answer: true },
    { text: "A Type 2 dimension inserts a new row with a new surrogate key when a tracked attribute changes.", answer: true },
    { text: "In a Type 2 dimension, existing fact rows must be updated to point to the new surrogate key.", answer: false },
  ],
  explain: "Type 1 keeps no history. Type 2 keeps history by adding versions, usually with validity dates and a current flag. Existing facts **keep** their old surrogate key. That's the whole point: past sales stay linked to the attributes that were true at the time.",
  refs: [{ t: 'Dimension tables', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/dimensional-modeling-dimension-tables' }]
},
{
  id: 'd2-07', s: 'load', type: 'single',
  stem: "Sales facts sometimes arrive before the new customer exists in `DimCustomer`. The customer details arrive a day later. Reports must link those sales to the correct customer once the details arrive, without reloading facts. What should you do?",
  options: [
    "Insert an **inferred member** row into `DimCustomer` with the business key and placeholder attributes, and update it when the details arrive",
    "Assign the facts to the `Unknown` member (key -1) permanently",
    "Discard the facts until the customer exists",
    "Store the facts in a separate table and union it in reports",
  ],
  answer: 0,
  explain: "An **inferred member** (late-arriving dimension) creates the dimension row early, so the fact gets a real surrogate key right away. When the full details arrive, you update the placeholder attributes in place.\n\nMapping to -1 loses the link permanently. Discarding facts loses data. A separate table complicates every report.",
  refs: [{ t: 'Load dimension tables', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/dimensional-modeling-load-tables' }]
},
{
  id: 'd2-08', s: 'load', type: 'single',
  stem: "A fact table has `OrderDateKey`, `ShipDateKey` and `DeliveryDateKey`. How should you model the dates?",
  options: [
    "One `DimDate` table referenced three times as a role-playing dimension",
    "Three separate date tables with identical content loaded by three pipelines",
    "Store full dates in the fact table and drop the date dimension",
    "Combine the three keys into one composite key",
  ],
  answer: 0,
  explain: "A **role-playing dimension** is a single dimension used in several roles. One `DimDate` serves order, ship and delivery dates. In Power BI you use inactive relationships with `USERELATIONSHIP`, or one model table per role if needed, but the warehouse keeps a single source table.",
  refs: [{ t: 'Dimension tables', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/dimensional-modeling-dimension-tables' }]
},
{
  id: 'd2-09', s: 'load', type: 'single',
  stem: "Raw JSON telemetry lands in a KQL table named `RawEvents`. You need a parsed, typed table that fills automatically as data is ingested, with no scheduled jobs. What should you use?",
  options: [
    "An update policy on the target table that runs a function over `RawEvents`",
    "A materialized view with `take_any()`",
    "A pipeline that runs every minute",
    "A Spark structured streaming job",
  ],
  answer: 0,
  explain: "An **update policy** runs a query each time data is ingested into the source table and writes the result to the target table, in the same ingestion transaction. It's the standard medallion pattern inside an eventhouse.\n\nMaterialized views are for aggregations. A schedule adds latency.",
  refs: [{ t: 'Update policy', u: 'https://learn.microsoft.com/en-us/kusto/management/update-policy' }]
},
{
  id: 'd2-10', s: 'load', type: 'single',
  stem: "A source system has `Product`, `Subcategory` and `Category` tables. You are building a star schema for Power BI. What should you do?",
  options: [
    "Join them into one denormalized `DimProduct` with subcategory and category columns",
    "Load the three tables as separate dimensions linked to each other (a snowflake)",
    "Add the category name to every fact row",
    "Create a bridge table between product and category",
  ],
  answer: 0,
  explain: "In a star schema, each dimension is a single **denormalized** table. Flattening the hierarchy into `DimProduct` gives simpler models and faster queries. Snowflaking adds joins. Putting attributes in the fact table bloats it. Bridges are for many-to-many relationships.",
  refs: [{ t: 'Dimensional modeling', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/dimensional-modeling-overview' }]
},

// ---------- Batch ----------
{
  id: 'd2-11', s: 'batch', type: 'single',
  stem: "A team of SQL developers needs a data store that supports full T-SQL DML and transactions across several tables. Which Fabric item should they use?",
  options: ['Warehouse', 'Lakehouse', 'Eventhouse', 'Mirrored database'],
  answer: 0,
  explain: "A **Warehouse** offers full T-SQL reads and writes, including multi-table transactions. A lakehouse's SQL analytics endpoint is **read-only**; you write to it with Spark. An eventhouse uses KQL. A mirrored database is read-only in Fabric.",
  refs: [{ t: 'Choose a data store', u: 'https://learn.microsoft.com/en-us/fabric/fundamentals/decision-guide-data-store' }]
},
{
  id: 'd2-12', s: 'batch', type: 'single',
  stem: "Data scientists work in PySpark with semi-structured JSON, images and Delta tables in the same item. Which data store should you choose?",
  options: ['Lakehouse', 'Warehouse', 'SQL database', 'Eventhouse'],
  answer: 0,
  explain: "A **Lakehouse** stores any file type in its Files section alongside Delta tables, and Spark is its main engine. Warehouses and SQL databases are relational. Eventhouses are built for time-series and event data queried with KQL.",
  refs: [{ t: 'Choose a data store', u: 'https://learn.microsoft.com/en-us/fabric/fundamentals/decision-guide-data-store' }]
},
{
  id: 'd2-13', s: 'batch', type: 'single',
  stem: "You need to store billions of log events per day and run sub-second queries over recent data with KQL. Which data store should you choose?",
  options: ['Eventhouse', 'Lakehouse', 'Warehouse', 'SQL database'],
  answer: 0,
  explain: "An **Eventhouse** (KQL database) is optimized for high-volume, time-based data: fast ingestion, automatic indexing and a hot cache for recent data. It's the natural home for logs and telemetry.",
  refs: [{ t: 'Eventhouse overview', u: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/eventhouse' }]
},
{
  id: 'd2-14', s: 'batch', type: 'statements',
  stem: "You are working with the SQL analytics endpoint of a lakehouse.",
  statements: [
    { text: "You can create views and inline functions on the SQL analytics endpoint.", answer: true },
    { text: "You can run INSERT statements against the lakehouse's Delta tables through the SQL analytics endpoint.", answer: false },
    { text: "You can join a lakehouse table with a warehouse table in the same workspace by using three-part names.", answer: true },
  ],
  explain: "The SQL analytics endpoint is **read-only for data**, but you can create views, functions and security objects on it. Use Spark (or pipelines and dataflows) to write. Cross-database queries with `database.schema.table` work across warehouses and SQL analytics endpoints in the same workspace.",
  refs: [{ t: 'SQL analytics endpoint', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-sql-analytics-endpoint' }]
},
{
  id: 'd2-15', s: 'batch', type: 'single',
  stem: "Business analysts who know Power Query need to clean and reshape about 1 million rows from SharePoint and Excel files each day and load them into a lakehouse. Which tool should they use?",
  options: ['Dataflow Gen2', 'A PySpark notebook', 'T-SQL stored procedures', 'Spark structured streaming'],
  answer: 0,
  explain: "**Dataflow Gen2** is the low-code, Power Query-based choice. It has hundreds of connectors and transformations and can write to a lakehouse, warehouse or other destinations. Notebooks and T-SQL require coding skills these users don't have.",
  refs: [{ t: 'Dataflow Gen2 overview', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/dataflows-gen2-overview' }]
},
{
  id: 'd2-16', s: 'batch', type: 'single',
  stem: "Data is already in staging tables in a Fabric warehouse. A team of SQL developers must build the gold tables with complex joins and aggregations. Which approach should they use?",
  options: [
    "T-SQL stored procedures with CTAS and INSERT ... SELECT in the warehouse",
    "Export the data to a lakehouse and use PySpark",
    "Dataflow Gen2 with staging enabled",
    "A KQL update policy",
  ],
  answer: 0,
  explain: "When data already sits in the warehouse and the team knows SQL, transform it **in place** with T-SQL. Moving it out to Spark adds copies and skills the team doesn't need. Dataflows are aimed at Power Query users, and KQL doesn't apply to warehouses.",
  refs: [{ t: 'Ingest data with T-SQL', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/ingest-data-tsql' }]
},
{
  id: 'd2-17', s: 'batch', type: 'single',
  stem: "A partner keeps Delta tables in their ADLS Gen2 account. You need those tables to appear as lakehouse tables that can be queried through the SQL analytics endpoint, without copying data. What should you do?",
  options: [
    "Create ADLS Gen2 shortcuts in the **Tables** section, each pointing to a Delta table folder",
    "Create one shortcut in the **Files** section that points to the container",
    "Use a Copy activity to load the tables",
    "Mirror the storage account",
  ],
  answer: 0,
  explain: "Shortcuts in the **Tables** section that point to a Delta table's folder are registered as tables and appear in the SQL analytics endpoint and in Spark. Shortcuts in Files are just folders, and a Copy activity duplicates the data.",
  refs: [{ t: 'OneLake shortcuts', u: 'https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts' }]
},
{
  id: 'd2-18', s: 'batch', type: 'statements',
  stem: "You are using OneLake shortcuts.",
  statements: [
    { text: "Deleting a shortcut also deletes the data at its target location.", answer: false },
    { text: "An ADLS Gen2 shortcut requires the storage account to have hierarchical namespace enabled.", answer: true },
    { text: "A shortcut can point to an Amazon S3 bucket.", answer: true },
  ],
  explain: "A shortcut is a pointer: deleting it leaves the target untouched. ADLS shortcuts use the DFS endpoint, which needs a hierarchical namespace. Supported targets include OneLake, ADLS Gen2, Amazon S3, S3-compatible storage, Google Cloud Storage, Azure Blob Storage, Dataverse and more.",
  refs: [{ t: 'OneLake shortcuts', u: 'https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts' }]
},
{
  id: 'd2-19', s: 'batch', type: 'single',
  stem: "You are setting up mirroring for an Azure SQL Database. Which prerequisite must you configure on the source?",
  options: [
    "Enable the system-assigned managed identity on the Azure SQL logical server",
    "Enable change data capture on every table",
    "Install an on-premises data gateway",
    "Upgrade the database to the Hyperscale tier",
  ],
  answer: 0,
  explain: "Mirroring for Azure SQL Database needs the logical server's **system-assigned managed identity** (SAMI) to be enabled, because it uses that identity to publish changes to OneLake. Mirroring uses its own change feed, so you don't enable CDC. A gateway is only needed for sources on private networks or on-premises. A specific service tier isn't the requirement here.",
  refs: [{ t: 'Mirroring Azure SQL Database', u: 'https://learn.microsoft.com/en-us/fabric/mirroring/azure-sql-database' }]
},
{
  id: 'd2-20', s: 'batch', type: 'statements',
  stem: "You mirror an operational database into Fabric.",
  statements: [
    { text: "Mirrored tables are stored in OneLake in Delta format.", answer: true },
    { text: "You can update mirrored tables by using the SQL analytics endpoint.", answer: false },
    { text: "The compute used to replicate data into OneLake doesn't consume your capacity's CUs.", answer: true },
  ],
  explain: "Mirroring writes Delta tables into OneLake and creates a **read-only** SQL analytics endpoint. Microsoft doesn't charge capacity for the background replication compute, and some storage is free in proportion to the capacity size. **Querying** the data still consumes CUs.",
  refs: [{ t: 'Mirroring overview', u: 'https://learn.microsoft.com/en-us/fabric/mirroring/overview' }]
},
{
  id: 'd2-21', s: 'batch', type: 'single',
  stem: "A software vendor's application can write its own change data as Parquet files with row markers for inserts, updates and deletes. You want Fabric to apply those changes to replicated tables continuously. What should you use?",
  options: ['Open mirroring', 'A Copy job', 'An eventstream custom endpoint', 'A lakehouse shortcut'],
  answer: 0,
  explain: "**Open mirroring** lets any application write change files into a landing zone in OneLake. Fabric then applies them to Delta tables with mirroring semantics. A Copy job pulls from supported sources. An eventstream carries events, not table changes. A shortcut only points at data.",
  refs: [{ t: 'Open mirroring', u: 'https://learn.microsoft.com/en-us/fabric/mirroring/open-mirroring' }]
},
{
  id: 'd2-22', s: 'batch', type: 'single',
  stem: "A pipeline must copy data from a SQL Server database in your on-premises data center. What is required?",
  options: [
    "An on-premises data gateway and a connection that uses it",
    "A virtual network data gateway",
    "A OneLake shortcut",
    "A workspace identity",
  ],
  answer: 0,
  explain: "On-premises sources are reached through the **on-premises data gateway**. The **virtual network data gateway** is for Azure resources inside a virtual network. Shortcuts don't support SQL Server, and a workspace identity doesn't provide network access to on-premises systems.",
  refs: [{ t: 'On-premises data gateway in pipelines', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/how-to-access-on-premises-data' }]
},
{
  id: 'd2-23', s: 'batch', type: 'single',
  stem: "A Copy activity loads a daily full snapshot of a source table into a lakehouse table. The table must contain only the latest snapshot. Which table action should you choose?",
  options: ['Overwrite', 'Append', 'Upsert on all columns', 'None'],
  answer: 0,
  explain: "**Overwrite** replaces the table contents on each run, which matches a full-snapshot load. **Append** would add a new copy every day.",
  refs: [{ t: 'Lakehouse connector in Copy activity', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/connector-lakehouse-copy-activity' }]
},
{
  id: 'd2-24', s: 'batch', type: 'dropdown',
  stem: "You need the total sales amount and the number of distinct customers per region. How should you complete the PySpark code?",
  code:
`from pyspark.sql import functions as F

result = (df.groupBy("Region")
    .[[0]](
        F.sum("Amount").alias("TotalAmount"),
        F.[[1]]("CustomerID").alias("Customers")))`,
  blanks: [
    { options: ['agg', 'select', 'withColumn', 'filter'], answer: 0 },
    { options: ['countDistinct', 'count', 'sum', 'first'], answer: 0 },
  ],
  explain: "`groupBy(...).agg(...)` applies several aggregations at once. `countDistinct` counts unique customers. `count` would count rows, so repeat customers would be counted more than once.",
  refs: [{ t: 'PySpark GroupedData.agg', u: 'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.GroupedData.agg.html' }]
},
{
  id: 'd2-25', s: 'batch', type: 'dropdown',
  stem: "You need to create a new warehouse table with daily totals per store. How should you complete the T-SQL?",
  code:
`[[0]] dbo.FactSalesDaily
AS
SELECT SaleDate, StoreID, SUM(Amount) AS Total
FROM dbo.FactSales
[[1]] SaleDate, StoreID;`,
  blanks: [
    { options: ['CREATE TABLE', 'INSERT INTO', 'CREATE VIEW', 'ALTER TABLE'], answer: 0 },
    { options: ['GROUP BY', 'PARTITION BY', 'ORDER BY', 'HAVING'], answer: 0 },
  ],
  explain: "**CREATE TABLE AS SELECT** (CTAS) creates and fills a table in one statement and is fully supported in Fabric warehouses. A view would store no data. `GROUP BY` defines the aggregation level. `PARTITION BY` is used only inside window functions.",
  refs: [{ t: 'Ingest data with T-SQL', u: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/ingest-data-tsql' }]
},
{
  id: 'd2-26', s: 'batch', type: 'single',
  stem: "A KQL table receives repeated readings per device. You need the most recent row per `DeviceId` with all its columns. Which query should you use?",
  options: [
    "`Readings | summarize arg_max(Timestamp, *) by DeviceId`",
    "`Readings | summarize max(Timestamp) by DeviceId`",
    "`Readings | distinct DeviceId`",
    "`Readings | take 1`",
  ],
  answer: 0,
  explain: "`arg_max(Timestamp, *)` returns the whole row that has the highest timestamp for each group. `max(Timestamp)` returns only the timestamp. `distinct` returns only the keys. `take 1` returns one arbitrary row.",
  refs: [{ t: 'arg_max()', u: 'https://learn.microsoft.com/en-us/kusto/query/arg-max-aggregation-function' }]
},
{
  id: 'd2-27', s: 'batch', type: 'statements',
  stem: "You are writing KQL joins.",
  statements: [
    { text: "If you don't specify `kind`, the join is `innerunique`, which removes duplicate keys from the left side before joining.", answer: true },
    { text: "`kind=leftouter` keeps every row from the left table.", answer: true },
    { text: "`kind=leftanti` returns rows from the right table that have no match on the left.", answer: false },
  ],
  explain: "KQL's default join kind is **innerunique**, which often surprises SQL users because it deduplicates left keys. `leftouter` keeps all left rows. `leftanti` returns **left** rows with no match on the right; `rightanti` does the reverse.",
  refs: [{ t: 'join operator', u: 'https://learn.microsoft.com/en-us/kusto/query/join-operator' }]
},
{
  id: 'd2-28', s: 'batch', type: 'single',
  stem: "In a DataFrame, you need to replace nulls in `Quantity` with 0 and nulls in `Channel` with `'Unknown'`. Which code should you use?",
  options: [
    "`df.fillna({'Quantity': 0, 'Channel': 'Unknown'})`",
    "`df.dropna(subset=['Quantity', 'Channel'])`",
    "`df.replace(None, 0)`",
    "`df.na.drop(how='all')`",
  ],
  answer: 0,
  explain: "`fillna` with a dictionary sets a different replacement value per column. `dropna` and `na.drop` remove rows instead of filling them. A single value in `replace` can't give each column its own type-appropriate default.",
  refs: [{ t: 'PySpark DataFrame.fillna', u: 'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.fillna.html' }]
},
{
  id: 'd2-29', s: 'batch', type: 'single',
  stem: "A DataFrame has duplicate orders. Each `OrderID` must appear once; it doesn't matter which duplicate is kept. Which code should you use?",
  options: [
    "`df.dropDuplicates(['OrderID'])`",
    "`df.distinct()`",
    "`df.groupBy('OrderID').count()`",
    "`df.filter('OrderID IS NOT NULL')`",
  ],
  answer: 0,
  explain: "`dropDuplicates` with a column list keeps one row per key. `distinct()` removes only rows that are identical in **every** column, so duplicates with different values would stay. When it **does** matter which row survives (for example the latest), use a window with `row_number()` instead.",
  refs: [{ t: 'PySpark dropDuplicates', u: 'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.dropDuplicates.html' }]
},
{
  id: 'd2-30', s: 'batch', type: 'single',
  stem: "Each order row has a column `Lines` that holds an array of order-line structs. You need one row per order line. Which function should you use?",
  options: ['`explode`', '`flatten`', '`collect_list`', '`array_contains`'],
  answer: 0,
  explain: "`explode` turns each array element into its own row, for example `df.select('OrderID', F.explode('Lines').alias('Line'))`. Then select `Line.*` to get the struct fields as columns. `flatten` merges nested arrays into one array. `collect_list` does the opposite of explode.",
  refs: [{ t: 'PySpark explode', u: 'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.functions.explode.html' }]
},
{
  id: 'd2-31', s: 'batch', type: 'single',
  stem: "A Dataflow Gen2 reads yesterday's orders from an API each morning and loads them into a lakehouse table that holds all history. Which update method should you set on the data destination?",
  options: ['Append', 'Replace', 'Overwrite schema', 'No destination; use staging'],
  answer: 0,
  explain: "Each run brings only new rows, so **Append** adds them to the history. **Replace** would delete everything except yesterday's orders.",
  refs: [{ t: 'Dataflow Gen2 data destinations', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/dataflow-gen2-data-destinations-and-managed-settings' }]
},

// ---------- Streaming ----------
{
  id: 'd2-32', s: 'stream', type: 'single',
  stem: "You need to read events from Azure Event Hubs, filter out some fields and route them to an eventhouse and an Activator item, all without writing code. What should you use?",
  options: ['Eventstream', 'Spark structured streaming', 'A KQL update policy', 'A Copy job'],
  answer: 0,
  explain: "**Eventstream** is the no-code engine for capturing, transforming and routing real-time events to several destinations. Spark structured streaming needs code. Update policies only work after the data is in an eventhouse. Copy jobs move data in batches.",
  refs: [{ t: 'Eventstreams overview', u: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/event-streams/overview' }]
},
{
  id: 'd2-33', s: 'stream', type: 'single',
  stem: "A streaming workload needs stateful deduplication, joins with a large Delta reference table and custom Python logic, and must write to Delta tables. Which engine fits best?",
  options: ['Spark structured streaming', 'Eventstream', 'KQL materialized views', 'Dataflow Gen2'],
  answer: 0,
  explain: "**Spark structured streaming** handles complex, stateful, code-based processing and writes natively to Delta. Eventstream transformations are simpler. Materialized views aggregate inside an eventhouse. Dataflows are batch tools.",
  refs: [{ t: 'Stream data into a lakehouse', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-streaming-data' }]
},
{
  id: 'd2-34', s: 'stream', type: 'single',
  stem: "You need to count events every 10 seconds, with each event counted exactly once. Which window type should you use?",
  options: ['Tumbling', 'Hopping', 'Sliding', 'Session'],
  answer: 0,
  explain: "**Tumbling** windows are fixed-size, back-to-back and non-overlapping, so every event falls into exactly one window. Hopping windows overlap. Sliding windows produce output when events enter or leave. Session windows depend on gaps between events.",
  refs: [{ t: 'Eventstream windowing', u: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/event-streams/process-events-using-event-processor-editor' }]
},
{
  id: 'd2-35', s: 'stream', type: 'statements',
  stem: "You are choosing windowing functions for stream processing.",
  statements: [
    { text: "In a hopping window, an event can belong to more than one window.", answer: true },
    { text: "A session window closes after a set period with no events.", answer: true },
    { text: "Tumbling windows overlap when the window size is larger than one minute.", answer: false },
  ],
  explain: "Hopping windows overlap whenever the hop is shorter than the window size. Session windows group bursts of activity and close after a timeout gap, with an optional maximum duration. Tumbling windows **never** overlap, whatever their size.",
  refs: [{ t: 'Eventstream windowing', u: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/event-streams/process-events-using-event-processor-editor' }]
},
{
  id: 'd2-36', s: 'stream', type: 'dropdown',
  stem: "You need to write a stream of raw events to the Delta table `telemetry_bronze` so that the job can restart from where it stopped. How should you complete the code?",
  code:
`query = (df.writeStream
    .format("delta")
    .outputMode("[[0]]")
    .option("[[1]]", "Files/checkpoints/telemetry_bronze")
    .[[2]]("telemetry_bronze"))`,
  blanks: [
    { options: ['append', 'complete', 'update'], answer: 0 },
    { options: ['checkpointLocation', 'path', 'mergeSchema'], answer: 0 },
    { options: ['toTable', 'saveAsTable', 'insertInto'], answer: 0 },
  ],
  explain: "Raw events are only ever added, so use `append`. The **checkpoint location** stores offsets and state so the query resumes exactly where it stopped. `toTable()` starts a streaming query that writes to a table. `saveAsTable` and `insertInto` are batch writer methods.",
  refs: [{ t: 'Stream data into a lakehouse', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-streaming-data' }]
},
{
  id: 'd2-37', s: 'stream', type: 'single',
  stem: "A streaming aggregation counts events per 5-minute window. Events can arrive up to 10 minutes late, and the job's state keeps growing. What should you add?",
  options: [
    "`.withWatermark('EventTime', '10 minutes')` before the windowed aggregation",
    "`.trigger(processingTime='10 minutes')`",
    "`.option('maxFilesPerTrigger', 10)`",
    "`.coalesce(10)`",
  ],
  answer: 0,
  explain: "A **watermark** tells Spark how late data may arrive. Events within 10 minutes of the latest event time are still counted, and Spark can then **drop state** for older windows, which stops the growth. Append mode with aggregations also requires a watermark.\n\nTriggers control how often micro-batches run, not lateness.",
  refs: [{ t: 'Structured Streaming: watermarking', u: 'https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html#handling-late-data-and-watermarking' }]
},
{
  id: 'd2-38', s: 'stream', type: 'single',
  stem: "A streaming notebook should process all the data that has arrived since its last run and then stop, so it can run on a schedule like a batch job. Which trigger should you use?",
  options: [
    "`.trigger(availableNow=True)`",
    "`.trigger(processingTime='1 minute')`",
    "`.trigger(continuous='1 second')`",
    "No trigger",
  ],
  answer: 0,
  explain: "`availableNow` processes everything available, possibly in several micro-batches, and then **stops**, while keeping checkpoint semantics. That gives you incremental batch processing. Processing-time triggers and the default trigger run forever.",
  refs: [{ t: 'Structured Streaming triggers', u: 'https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html#triggers' }]
},
{
  id: 'd2-39', s: 'stream', type: 'single',
  stem: "You add an eventhouse destination to an eventstream. Before the events land, you must drop a field and filter out heartbeat events. Which ingestion mode should you choose?",
  options: [
    "Event processing before ingestion",
    "Direct ingestion",
    "Queued ingestion from OneLake",
    "Streaming ingestion with an update policy only",
  ],
  answer: 0,
  explain: "With **event processing before ingestion**, the eventstream applies its transformations (filter, manage fields and so on) and then writes to the eventhouse. **Direct ingestion** sends the raw stream straight to the KQL table, so you would have to transform it afterwards, for example with an update policy.",
  refs: [{ t: 'Add an eventhouse destination', u: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/event-streams/add-destination-kql-database' }]
},
{
  id: 'd2-40', s: 'stream', type: 'single',
  stem: "You need to capture row-level inserts, updates and deletes from an Azure SQL Database as a real-time event stream in Fabric. What should you use?",
  options: [
    "An eventstream with the Azure SQL Database CDC source",
    "A Copy job with full copy",
    "An ADLS Gen2 shortcut",
    "A Dataflow Gen2 refreshed every 15 minutes",
  ],
  answer: 0,
  explain: "Eventstream has **CDC sources** for Azure SQL Database, PostgreSQL, MySQL, Cosmos DB and others. They emit change events you can route to an eventhouse, Activator or a lakehouse. CDC must be enabled on the source database and tables.\n\nThe other options are batch tools or not relevant.",
  refs: [{ t: 'Azure SQL Database CDC source', u: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/event-streams/add-source-azure-sql-database-change-data-capture' }]
},
{
  id: 'd2-41', s: 'stream', type: 'dropdown',
  stem: "You need an always up-to-date table in an eventhouse that holds the latest reading per device, without recalculating it at query time. How should you complete the command?",
  code:
`.create [[0]] DeviceLatest on table Telemetry
{
    Telemetry
    | summarize [[1]](Timestamp, *) by DeviceId
}`,
  blanks: [
    { options: ['materialized-view', 'function', 'table', 'external table'], answer: 0 },
    { options: ['arg_max', 'max', 'take_any', 'count'], answer: 0 },
  ],
  explain: "A **materialized view** keeps an aggregation over its source table up to date as data is ingested. `arg_max(Timestamp, *)` keeps the latest full row per device. This is a common pattern for 'latest state' and for deduplication.",
  refs: [{ t: 'Materialized views', u: 'https://learn.microsoft.com/en-us/kusto/management/materialized-views/materialized-view-overview' }]
},
{
  id: 'd2-42', s: 'stream', type: 'single',
  stem: "A Spark structured streaming job must run continuously in production and restart automatically if it fails. What should you use?",
  options: [
    "A Spark job definition with a retry policy",
    "An interactive notebook left open in the browser",
    "A pipeline that runs the notebook every 5 minutes",
    "A Dataflow Gen2",
  ],
  answer: 0,
  explain: "**Spark job definitions** run long-running batch or streaming applications, and their **retry policy** restarts the job after a failure. An interactive session times out. Rescheduling a notebook repeatedly isn't continuous streaming.",
  refs: [{ t: 'Spark job definition', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/spark-job-definition' }, { t: 'Stream data into a lakehouse', u: 'https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-streaming-data' }]
},
{
  id: 'd2-43', s: 'stream', type: 'single',
  stem: "A dashboard needs one value per device for every minute of the last hour, and minutes with no events must show 0. Which KQL operator should you use?",
  options: ['`make-series`', '`summarize ... by bin()`', '`top-nested`', '`mv-expand`'],
  answer: 0,
  explain: "`make-series` builds a regular time series over a range with a fixed step and fills empty steps with a `default` value, for example `make-series Count = count() default = 0 on Timestamp from ago(1h) to now() step 1m by DeviceId`. `summarize by bin()` returns no row at all for empty bins.",
  refs: [{ t: 'make-series', u: 'https://learn.microsoft.com/en-us/kusto/query/make-series-operator' }]
},

// ---------- Yes/No series: incremental load ----------
{
  id: 'd2-s2a', s: 'load', type: 'single', series: 's2',
  stem: "**This question is part of a series that presents the same scenario. Each question has a unique solution. Determine whether the solution meets the goal.**\n\nAn Azure SQL Database table has a reliable `LastModified` column. Every night you must load only new and changed rows into a lakehouse table, with minimal development effort.\n\nSolution: You create a Copy job that uses incremental copy with `LastModified` as the incremental column.\n\nDoes this meet the goal?",
  options: ['Yes', 'No'],
  answer: 0,
  explain: "**Yes.** A Copy job keeps the watermark for you and copies only rows whose incremental column has advanced.",
  refs: [{ t: 'What is Copy job?', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/what-is-copy-job' }]
},
{
  id: 'd2-s2b', s: 'load', type: 'single', series: 's2',
  stem: "**This question is part of a series that presents the same scenario. Each question has a unique solution. Determine whether the solution meets the goal.**\n\nAn Azure SQL Database table has a reliable `LastModified` column. Every night you must load only new and changed rows into a lakehouse table, with minimal development effort.\n\nSolution: You create a pipeline with a Copy activity that copies the whole table with the table action set to Overwrite.\n\nDoes this meet the goal?",
  options: ['Yes', 'No'],
  answer: 1,
  explain: "**No.** That is a full load: it copies every row each night, not just the new and changed ones.",
  refs: [{ t: 'Lakehouse connector in Copy activity', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/connector-lakehouse-copy-activity' }]
},
{
  id: 'd2-s2c', s: 'load', type: 'single', series: 's2',
  stem: "**This question is part of a series that presents the same scenario. Each question has a unique solution. Determine whether the solution meets the goal.**\n\nAn Azure SQL Database table has a reliable `LastModified` column. Every night you must load only new and changed rows into a lakehouse table, with minimal development effort.\n\nSolution: You create a Dataflow Gen2 that reads the whole table and uses the Replace update method.\n\nDoes this meet the goal?",
  options: ['Yes', 'No'],
  answer: 1,
  explain: "**No.** Replace rewrites the destination from a full read of the source. It isn't incremental.",
  refs: [{ t: 'Dataflow Gen2 data destinations', u: 'https://learn.microsoft.com/en-us/fabric/data-factory/dataflow-gen2-data-destinations-and-managed-settings' }]
}
);
