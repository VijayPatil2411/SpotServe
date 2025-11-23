import React, { useRef, useEffect } from "react";
import "./ReceiptModal.css";

const ReceiptModal = ({ receipt, onClose }) => {
  const boxRef = useRef(null);

  useEffect(() => {
    const handleDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) onClose();
    };
    const handleKey = (e) => e.key === "Escape" && onClose();

    document.addEventListener("mousedown", handleDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  if (!receipt) return null;

  const handlePrint = () => {
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Receipt</title>
          <style>
            html,body{margin:0;padding:10px;font-family:Arial,Helvetica,sans-serif;color:#111}
            .wrap{max-width:500px;margin:0 auto}
            h2{margin:0 0 8px 0;font-size:18px}
            .meta{font-size:12px;color:#666;margin-bottom:8px}
            .box{border:1px solid #e6e6e6;padding:10px;border-radius:6px}
            .kv{display:flex;justify-content:space-between;margin:6px 0;font-size:13px}
            .kv .k{color:#666}
            .total{display:flex;justify-content:space-between;margin-top:8px;font-weight:800;color:#007bff}
            hr{border:none;border-top:1px solid #eee;margin:8px 0}
            @page{margin:10mm}
          </style>
        </head>
        <body>
          <div class="wrap">
            <h1>SpotServe</h1>
            <h2>Payment Receipt</h2>
            <div class="meta">
              Job #${receipt.jobId || "-"} • 
              ${receipt.createdAt ? new Date(receipt.createdAt).toLocaleString() : ""}
            </div>

            <div class="box">
              <!-- SERVICE -->
              <div style="font-weight:700;margin-bottom:6px">Service</div>
              <div class="kv"><div class="k">Status</div><div>${receipt.status || "-"}</div></div>
              <div class="kv"><div class="k">Service</div><div>${receipt.serviceName || "-"}</div></div>

              <hr/>

              <!-- CUSTOMER -->
              <div style="font-weight:700;margin-bottom:6px">Customer</div>
              <div class="kv"><div class="k">Name</div><div>${receipt.customerName || "-"}</div></div>
              <div class="kv"><div class="k">ID</div><div>${receipt.customerId || "-"}</div></div>
              ${receipt.customerPhone ? `<div class="kv"><div class="k">Phone</div><div>${receipt.customerPhone}</div></div>` : ""}

              <hr/>

              <!-- VEHICLE -->
              <div style="font-weight:700;margin-bottom:6px">Vehicle</div>
              <div class="kv"><div class="k">Plate</div><div>${receipt.vehiclePlateNo || "-"}</div></div>
              ${receipt.location ? `<div class="kv"><div class="k">Location</div><div>${receipt.location}</div></div>` : ""}

              <hr/>

              <!-- MECHANIC -->
              <div style="font-weight:700;margin-bottom:6px">Mechanic</div>
              <div class="kv"><div class="k">Name</div><div>${receipt.mechanicName || "-"}</div></div>
              <div class="kv"><div class="k">ID</div><div>${receipt.mechanicId || "-"}</div></div>

              <hr/>

              <!-- BILLING -->
              <div style="font-weight:700;margin-bottom:6px">Billing</div>
              <div class="kv"><div class="k">Base Amount</div><div>₹${receipt.baseAmount ?? 0}</div></div>
              <div class="kv"><div class="k">Extra Amount</div><div>₹${receipt.extraAmount ?? 0}</div></div>
              ${receipt.discount != null ? `<div class="kv"><div class="k">Discount</div><div>- ₹${receipt.discount}</div></div>` : ""}
              <hr/>
              <div class="total">
                <div>Total</div>
                <div>₹${receipt.totalAmount ?? ((receipt.baseAmount ?? 0) + (receipt.extraAmount ?? 0))}</div>
              </div>
            </div>
          </div>
        </body>
      </html>`;
    
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return window.print();

    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();

    setTimeout(() => {
      try { w.print(); } catch {}
      setTimeout(() => { try { w.close(); } catch {} }, 500);
    }, 250);
  };

  return (
    <div className="rm-overlay" role="dialog" aria-modal="true">
      <div className="rm-container" ref={boxRef} onMouseDown={(e) => e.stopPropagation()}>
        
        <header className="rm-header">
          <div>
            <h3 className="rm-title">Payment Receipt</h3>
            <div className="rm-sub">Job #{receipt.jobId || "-"}</div>
          </div>
          <button className="rm-close" onClick={onClose}>✕</button>
        </header>

        <div className="rm-body">

          {/* SERVICE FIRST */}
          <section className="rm-block">
            <h4 className="rm-section-title">Service</h4>
            <div className="rm-kv"><span className="k">Status</span><span className="v">{receipt.status || "-"}</span></div>
            <div className="rm-kv"><span className="k">Service</span><span className="v">{receipt.serviceName || "-"}</span></div>
          </section>

          {/* CUSTOMER */}
          <section className="rm-block">
            <h4 className="rm-section-title">Customer</h4>
            <div className="rm-kv"><span className="k">Name</span><span className="v">{receipt.customerName || "-"}</span></div>
            <div className="rm-kv"><span className="k">ID</span><span className="v">{receipt.customerId || "-"}</span></div>
            {receipt.customerPhone && (
              <div className="rm-kv"><span className="k">Phone</span><span className="v">{receipt.customerPhone}</span></div>
            )}
          </section>

          {/* VEHICLE */}
          <section className="rm-block">
            <h4 className="rm-section-title">Vehicle</h4>
            <div className="rm-kv"><span className="k">Plate No</span><span className="v">{receipt.vehiclePlateNo || "-"}</span></div>
            {receipt.location && (
              <div className="rm-kv"><span className="k">Location</span><span className="v">{receipt.location}</span></div>
            )}
          </section>

          {/* MECHANIC */}
          <section className="rm-block">
            <h4 className="rm-section-title">Mechanic</h4>
            <div className="rm-kv"><span className="k">Name</span><span className="v">{receipt.mechanicName || "-"}</span></div>
            <div className="rm-kv"><span className="k">ID</span><span className="v">{receipt.mechanicId || "-"}</span></div>
          </section>

          {/* BILLING */}
          <section className="rm-block rm-billing">
            <h4 className="rm-section-title">Billing</h4>
            <div className="rm-kv"><span className="k">Base Amount</span><span className="v">₹{receipt.baseAmount ?? 0}</span></div>
            <div className="rm-kv"><span className="k">Extra Amount</span><span className="v">₹{receipt.extraAmount ?? 0}</span></div>
            {receipt.discount != null && (
              <div className="rm-kv"><span className="k">Discount</span><span className="v">- ₹{receipt.discount}</span></div>
            )}
            <div className="rm-total-row">
              <span className="total-label">Total</span>
              <span className="total-value">
                ₹{receipt.totalAmount ?? ((receipt.baseAmount ?? 0) + (receipt.extraAmount ?? 0))}
              </span>
            </div>
          </section>

        </div>

        <footer className="rm-footer">
          <div className="rm-footer-actions">
            <button className="btn print" onClick={handlePrint}>Print</button>
            <button className="btn close" onClick={onClose}>Close</button>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default ReceiptModal;
