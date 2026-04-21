import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, ShieldCheck, BrainCircuit, BarChart3, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ResultsPanel = ({ params }) => {
  const [probability, setProbability] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:5000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        const data = await response.json();
        
        if (data.success) {
          setProbability(data.probability.toFixed(1));
        } else {
          console.error("Backend Error:", data.error);
        }
      } catch (err) {
        console.error("Failed to connect to Python backend.", err);
      }
      setLoading(false);
    };

    // Debounce the call slightly so we don't spam the server while sliding
    const timerId = setTimeout(() => {
      fetchPrediction();
    }, 300);

    return () => clearTimeout(timerId);
  }, [params]);

  const isHighRisk = probability > 50;
  const statusColor = isHighRisk ? '#FF265B' : '#00F0FF';
  const StatusIcon = isHighRisk ? ShieldAlert : ShieldCheck;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // --- HEADER ---
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 28, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('CLINICAL NEUROLOGY REPORT', 14, 18);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 45, 18);
      
      // --- PATIENT INFO BLOCK ---
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('PATIENT DEMOGRAPHICS', 14, 40);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Patient ID: ANON-830219', 14, 48);
      doc.text('DOB: --/--/----', 80, 48);
      doc.text('Evaluating Dept: Artificial Intelligence Diagnostic Unit', 14, 54);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 58, pageWidth - 14, 58);

      // --- DIAGNOSTIC SUMMARY ---
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Diagnostic Summary (ANN Evaluation)', 14, 70);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Calculated Probability Score: ${probability}%`, 14, 78);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(isHighRisk ? 220 : 0, isHighRisk ? 38 : 153, isHighRisk ? 38 : 76); // Red vs Greenish
      doc.text(`Risk Assessment: ${isHighRisk ? 'HIGH PROBABILITY DETECTED' : 'PARAMETERS NORMAL'}`, 14, 84);
      
      doc.setTextColor(40, 40, 40);

      // --- BIOMARKER PARAMETERS TABLE ---
      doc.setFontSize(12);
      doc.text('Acoustic Biomarker Parameters', 14, 100);

      const tableData = [
        ['Parameter', 'Value', 'Source Type'],
        ['MDVP:Fo(Hz)', params.fo?.toFixed(2) || '-', 'Live Audio Analysis'],
        ['MDVP:Fhi(Hz)', '223.64', 'Normative Baseline'],
        ['MDVP:Flo(Hz)', '145.21', 'Normative Baseline'],
        ['MDVP:Jitter(%)', params.jitter?.toFixed(5) || '-', 'Live Audio Analysis'],
        ['MDVP:Jitter(Abs)', '0.00002', 'Normative Baseline'],
        ['MDVP:RAP', '0.0019', 'Normative Baseline'],
        ['MDVP:PPQ', '0.0021', 'Normative Baseline'],
        ['Jitter:DDP', '0.0058', 'Normative Baseline'],
        ['MDVP:Shimmer', params.shimmer?.toFixed(4) || '-', 'Live Audio Analysis'],
        ['MDVP:Shimmer(dB)', '0.1630', 'Normative Baseline'],
        ['Shimmer:APQ3', '0.0095', 'Normative Baseline'],
        ['Shimmer:APQ5', '0.0105', 'Normative Baseline'],
        ['MDVP:APQ', '0.0133', 'Normative Baseline'],
        ['Shimmer:DDA', '0.0285', 'Normative Baseline'],
        ['NHR', '0.0115', 'Normative Baseline'],
        ['HNR', params.hnr?.toFixed(2) || '-', 'Live Audio Analysis'],
        ['RPDE', params.rpde?.toFixed(4) || '-', 'Live Audio Analysis'],
        ['DFA', params.dfa?.toFixed(4) || '-', 'Live Audio Analysis'],
        ['spread1', '-6.7593', 'Normative Baseline'],
        ['spread2', '0.1603', 'Normative Baseline'],
        ['D2', '2.1545', 'Normative Baseline'],
        ['PPE', '0.1230', 'Normative Baseline']
      ];

      autoTable(doc, {
        startY: 105,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { cellWidth: 40, halign: 'right' },
            2: { cellWidth: 90 }
        }
      });
      
      const finalY = doc.lastAutoTable.finalY || 160;

      // --- FOOTER AND SIGNATURE ---
      doc.setFontSize(10);
      doc.text('Note: This report is generated by an Artificial Neural Network intended for supplementary clinical mapping.', 14, finalY + 20);
      doc.text('It should not replace professional medical diagnosis.', 14, finalY + 26);
      
      doc.line(14, finalY + 45, 80, finalY + 45);
      doc.text('Authorized Signature', 14, finalY + 52);
      doc.text('AI Assessment Unit', 14, finalY + 58);

      // Save the PDF
      doc.save(`Clinical_Analysis_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="glass-panel right-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          <BrainCircuit size={20} /> Analysis
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>Real-time ANN Prediction</p>
      </div>

      <div ref={reportRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', padding: '10px' }}>
        
        {/* Main Status Display */}
        <div style={{ 
          background: 'rgba(0,0,0,0.4)', 
          borderRadius: '16px', 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          border: `1px solid ${statusColor}40`,
          boxShadow: `inset 0 0 20px ${statusColor}10`
        }}>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <StatusIcon size={48} color={statusColor} />
          </motion.div>

          <h3 style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>PREDICTION SCORE</h3>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '8px' }}>
            <span style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'Outfit', color: statusColor, textShadow: `0 0 15px ${statusColor}` }}>
              {probability}
            </span>
            <span style={{ fontSize: '24px', color: 'var(--text-muted)' }}>%</span>
          </div>

          <p style={{ marginTop: '16px', fontSize: '14px', fontWeight: '500', color: statusColor, letterSpacing: '1px' }}>
            {isHighRisk ? 'HIGH PROBABILITY DETECTED' : 'PARAMETERS NORMAL'}
          </p>
        </div>

        {/* Feature Importance Bars */}
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            <BarChart3 size={14} /> FEATURE IMPACT
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Freq Variations', val: params.jitter * 1000 },
              { label: 'Amp Variations', val: params.shimmer * 400 },
              { label: 'Noise Ratio', val: (33 - params.hnr) }
            ].map((feature, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-main)' }}>{feature.label}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(feature.val * 3, 100)}%` }}
                    transition={{ duration: 0.5 }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-purple))' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
        <button 
          className="glass-button" 
          onClick={handleExport}
          disabled={isExporting}
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          <Download size={18} /> {isExporting ? 'Generating PDF...' : 'Export Report'}
        </button>
      </div>
    </div>
  );
};

export default ResultsPanel;
