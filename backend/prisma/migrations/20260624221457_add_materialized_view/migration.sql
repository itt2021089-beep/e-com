-- Create the Materialized View for instant sales reporting
CREATE MATERIALIZED VIEW admin_sales_report AS
SELECT
    DATE_TRUNC('day', o.created_at) AS sale_date,
    COUNT(DISTINCT o.id) AS total_orders,
    SUM(o.total_amount) AS total_revenue
FROM orders o
WHERE o.status = 'PAID' OR o.status = 'SHIPPED' OR o.status = 'DELIVERED'
GROUP BY DATE_TRUNC('day', o.created_at)
ORDER BY sale_date DESC;

-- Create a unique index so we can refresh this view CONCURRENTLY without locking it
CREATE UNIQUE INDEX admin_sales_report_date_idx ON admin_sales_report (sale_date);