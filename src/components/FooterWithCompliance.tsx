import React, { useState } from 'react';
import { 
  Shield, FileText, Info, Mail, AlertCircle, Users, Send, Youtube, Globe, BookOpen
} from 'lucide-react';
import { Glass3dIcon } from './Glass3dIcons';

interface FooterWithComplianceProps {
  onOpenSubscribeModal?: () => void;
}

export default function FooterWithCompliance({ onOpenSubscribeModal }: FooterWithComplianceProps = {}) {
  const [activePolicy, setActivePolicy] = useState<'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | null>(null);

  return (
    <footer className="bg-slate-900 text-slate-200 pt-8 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-10 px-4 md:px-6 border-t border-slate-800" id="adsense-footer">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* MOBILE MINIMIZED FOOTER / DESKTOP RESPONSIVE FOOTER */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-6 pb-6 md:pb-8 border-b border-slate-800/80">
          
          {/* Section 1: BytePrep: CS Branding */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <h3 className="font-black text-base text-white tracking-tight flex items-center gap-2.5">
              <div className="shrink-0">
                <Glass3dIcon type="books" size="sm" />
              </div>
              <span className="text-white font-black text-sm md:text-base">
                BytePrep : CS <span className="text-xs text-slate-400 font-normal hidden sm:inline">(DSSSBPYQ.Online)</span>
              </span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl font-medium hidden md:block">
              The premier interactive platform for DSSSB TGT Computer Science and Common Part A preparation. Access previous year papers, full mock tests, subject booster quizzes, and structured syllabus checklists completely free.
            </p>
          </div>

          {/* Section 2: Connect With Us with 3D Icons */}
          <div className="space-y-3">
            <h4 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>Connect With Us</span>
            </h4>
            <div className="flex items-center gap-3 pt-1">
              <button 
                onClick={() => {
                  if (onOpenSubscribeModal) {
                    onOpenSubscribeModal();
                  } else {
                    window.open('https://t.me/+k4QlJ1RnZl9lNWY9', '_blank');
                  }
                }}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/50 px-3 py-2 rounded-2xl transition-all shadow-[0_3px_0_0_#0f172a] active:translate-y-0.5 cursor-pointer"
                title="Join Official Telegram"
              >
                <Glass3dIcon type="telegram" size="sm" />
                <span className="text-xs font-bold text-sky-400">Telegram</span>
              </button>

              <button 
                onClick={() => {
                  if (onOpenSubscribeModal) {
                    onOpenSubscribeModal();
                  } else {
                    window.open('https://www.youtube.com/@dsssbpyqonline', '_blank');
                  }
                }}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-rose-500/50 px-3 py-2 rounded-2xl transition-all shadow-[0_3px_0_0_#0f172a] active:translate-y-0.5 cursor-pointer"
                title="YouTube Channel"
              >
                <Glass3dIcon type="youtube" size="sm" />
                <span className="text-xs font-bold text-rose-400">YouTube</span>
              </button>

              <a 
                href="https://dsssbpyq.online" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-2xl transition-all shadow-[0_3px_0_0_#0f172a] active:translate-y-0.5 cursor-pointer flex items-center justify-center"
                title="Official Website"
              >
                <Globe className="w-5 h-5 text-blue-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Below Component: About Us, Contact Us, Privacy Policy, Terms, Disclaimer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left" id="compliance-bottom-bar">
          <div className="flex items-center gap-2">
            <p className="text-[11px] md:text-xs text-slate-500">
              &copy; {new Date().getFullYear()} <span className="font-bold text-slate-400">BytePrep : CS</span>. All Rights Reserved.
            </p>
          </div>

          {/* AdSense compliance navigation links */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-2 text-xs font-bold text-slate-400" id="compliance-links">
            <button id="about-us-link" onClick={() => setActivePolicy('about')} className="hover:text-sky-400 transition-colors cursor-pointer bg-transparent border-0">About Us</button>
            <button id="contact-us-link" onClick={() => setActivePolicy('contact')} className="hover:text-sky-400 transition-colors cursor-pointer bg-transparent border-0">Contact Us</button>
            <a id="privacy-policy-link" href="/privacypolicy" className="hover:text-sky-400 transition-colors">Privacy Policy</a>
            <a id="terms-conditions-link" href="/terms" className="hover:text-sky-400 transition-colors">Terms &amp; Conditions</a>
            <button id="disclaimer-link" onClick={() => setActivePolicy('disclaimer')} className="hover:text-sky-400 transition-colors cursor-pointer bg-transparent border-0">Disclaimer</button>
          </div>
        </div>
      </div>

      {/* ADSENSE ESSENTIAL COMPLIANCE MODAL OVERLAYS */}
      {activePolicy && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto animate-fadeIn" id="compliance-modal-container">
          <div className="bg-white text-slate-800 border border-slate-200 rounded-3xl max-w-2xl w-full my-8 p-6 md:p-8 shadow-2xl relative space-y-6 max-h-[85vh] overflow-y-auto animate-slideUp" id="compliance-modal-content">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4" id="compliance-modal-header">
              <div className="flex items-center gap-2.5 text-blue-600">
                {activePolicy === 'privacy' && <Shield className="w-5 h-5 text-blue-600" />}
                {activePolicy === 'terms' && <FileText className="w-5 h-5 text-blue-600" />}
                {activePolicy === 'about' && <Info className="w-5 h-5 text-blue-600" />}
                {activePolicy === 'contact' && <Mail className="w-5 h-5 text-blue-600" />}
                {activePolicy === 'disclaimer' && <AlertCircle className="w-5 h-5 text-blue-600" />}
                <div className="font-extrabold text-slate-800 text-base md:text-lg uppercase tracking-tight">
                  {activePolicy === 'about' && 'About DSSSBPYQ.Online'}
                  {activePolicy === 'contact' && 'Contact Us'}
                  {activePolicy === 'privacy' && 'Privacy Policy'}
                  {activePolicy === 'terms' && 'Terms and Conditions'}
                  {activePolicy === 'disclaimer' && 'Disclaimers'}
                </div>
              </div>
              <button 
                id="compliance-close-btn-header"
                onClick={() => setActivePolicy(null)}
                className="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Policy Content Panels */}
            <div className="text-xs md:text-sm text-slate-600 space-y-4 leading-relaxed font-medium" id="compliance-text-container">
              
              {/* ABOUT US */}
              {activePolicy === 'about' && (
                <>
                  <p>
                    Welcome to <strong>DSSSBPYQ.Online</strong>, the primary open-access interactive preparation center for Delhi Subordinate Services Selection Board (DSSSB) TGT Computer Science examinations. Our pedagogical objective is simple: to make official examination mock tests, previous year papers (PYQs), and key subject revisions accessible instantly to every computer science aspirant.
                  </p>
                  <p>
                    We believe that government test preparation should not be blocked behind expensive corporate paywalls. By offering structured mock assessments, customizable dynamic test generation, and an interactive mistake tracking vault, we help students pinpoint areas of weakness and eliminate marginal errors.
                  </p>
                  <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">Our Key Features:</div>
                  <ul className="list-disc pl-5 space-y-1 text-xs font-semibold text-slate-700">
                    <li>Comprehensive PYQs with detailed, step-by-step explanations.</li>
                    <li>Syllabus mapping across Operating Systems, Networks, DBMS, and Teaching Methodology.</li>
                    <li>Adaptive Booster mode providing tailored remedial test packages based on weak topic algorithms.</li>
                    <li>Community feedback mechanisms with direct error transmission reporting channels.</li>
                  </ul>
                  <p>
                    For inquiries, feedback, or collaborative opportunities, please reach out via our contact details. Together, let's unlock your government career potential!
                  </p>
                </>
              )}

              {/* CONTACT US */}
              {activePolicy === 'contact' && (
                <>
                  <p>
                    We welcome inquiries from our community of aspirants, teachers, and technical contributors. If you have questions regarding the mock questions, found a bug, want to collaborate, or require technical support, please contact us.
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3" id="contact-details-box">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block font-bold uppercase">Official Support Email</span>
                        <span className="font-bold text-slate-700 text-xs md:text-sm">support@dsssbpyq.online</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-slate-500 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block font-bold uppercase">Telegram Aspirant Helpline</span>
                        <a href="https://t.me/+k4QlJ1RnZl9lNWY9" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs md:text-sm font-bold">
                          t.me/dsssbpyq_aspirants
                        </a>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs">
                    Our team generally replies to support/error reporting queries within 48-72 business hours. For urgent question corrections, please use the "Report Question" tool directly inside active practice screens.
                  </p>
                </>
              )}

              {/* PRIVACY POLICY */}
              {activePolicy === 'privacy' && (
                <>
                  <p>
                    At DSSSBPYQ.Online, accessible from https://dsssbpyq.online, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by DSSSBPYQ.Online and how we use it.
                  </p>
                  <div className="font-bold text-slate-800 text-xs uppercase">Log Files</div>
                  <p>
                    DSSSBPYQ.Online follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.
                  </p>
                  <div className="font-bold text-slate-800 text-xs uppercase">Cookies and Web Beacons</div>
                  <p>
                    Like any other website, DSSSBPYQ.Online uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
                  </p>
                  <div className="font-bold text-slate-800 text-xs uppercase">Google DoubleClick DART Cookie</div>
                  <p>
                    Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">https://policies.google.com/technologies/ads</a>.
                  </p>
                  <div className="font-bold text-slate-800 text-xs uppercase">GDPR Data Protection Rights &amp; CCPA</div>
                  <p>
                    We want to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following: the right to access, the right to rectification, the right to erasure, the right to restrict processing, and the right to data portability. If you make a request, we have one month to respond to you.
                  </p>
                </>
              )}

              {/* TERMS AND CONDITIONS */}
              {activePolicy === 'terms' && (
                <>
                  <p>
                    These terms and conditions outline the rules and regulations for the use of DSSSBPYQ.Online's Website, located at https://dsssbpyq.online. By accessing this website we assume you accept these terms and conditions. Do not continue to use DSSSBPYQ.Online if you do not agree to take all of the terms and conditions stated on this page.
                  </p>
                  <div className="font-bold text-slate-800 text-xs uppercase">License</div>
                  <p>
                    Unless otherwise stated, DSSSBPYQ.Online and/or its licensors own the intellectual property rights for all material on DSSSBPYQ.Online. All intellectual property rights are reserved. You may access this from DSSSBPYQ.Online for your own personal use subjected to restrictions set in these terms and conditions.
                  </p>
                  <div className="font-bold text-slate-800 text-xs uppercase">User Comments and Content Feedback</div>
                  <p>
                    Parts of this website offer an opportunity for users to submit feedback and reports regarding academic exam questions. DSSSBPYQ.Online does not filter, edit, publish or review comments prior to their presence on the website. Comments do not reflect the views and opinions of DSSSBPYQ.Online, its agents and/or affiliates.
                  </p>
                  <div className="font-bold text-slate-800 text-xs uppercase">Disclaimer of Warranties</div>
                  <p>
                    This Website is provided "as is," with all faults, and DSSSBPYQ.Online express no representations or warranties, of any kind related to this Website or the materials contained on this Website. Also, nothing contained on this Website shall be interpreted as advising you.
                  </p>
                </>
              )}

              {/* DISCLAIMER */}
              {activePolicy === 'disclaimer' && (
                <>
                  <p>
                    If you require any more information or have any questions about our site's disclaimer, please feel free to contact us by email at support@dsssbpyq.online.
                  </p>
                  <p>
                    All the information on this website - https://dsssbpyq.online - is published in good faith and for general information purpose only. DSSSBPYQ.Online does not make any warranties about the completeness, reliability and accuracy of this information. Any action you take upon the information you find on this website is strictly at your own risk. DSSSBPYQ.Online will not be liable for any losses and/or damages in connection with the use of our website.
                  </p>
                  <div className="font-bold text-slate-800 text-xs uppercase">Government Affiliation Disclaimer</div>
                  <p>
                    <strong>DSSSBPYQ.Online is an independent, private educational preparation website. We are NOT affiliated with, sponsored by, endorsed by, or in any way officially associated with the Delhi Subordinate Services Selection Board (DSSSB), the Government of National Capital Territory of Delhi (GNCTD), or any other Indian government department.</strong>
                  </p>
                  <p>
                    The official website for DSSSB is located at <a href="https://dsssb.delhi.gov.in" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">dsssb.delhi.gov.in</a>. Any PYQs or exam pattern simulations provided on DSSSBPYQ.Online are assembled for study assistance purposes only.
                  </p>
                </>
              )}

            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end pt-4 border-t border-slate-100" id="compliance-modal-footer">
              <button 
                id="compliance-accept-close-btn"
                onClick={() => setActivePolicy(null)}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs tracking-wide transition-all cursor-pointer shadow-md"
              >
                Accept and Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
