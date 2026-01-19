import { createPortal } from 'react-dom';
import './DesktopOnlyOverlay.css';


export function DesktopOnlyOverlay() {
    return createPortal(
        <div className="desktop-only-overlay">
            <div className="desktop-only-content">
                <div className="desktop-only-icon">💻</div>
                <h1>מערכת למחשב שולחני בלבד</h1>
                <p>מערכת זו מותאמת לעבודה על מחשב בלבד.<br />אנא התחבר דרך דפדפן במחשב שולחני או לפטופ.</p>
            </div>
        </div>,
        document.body
    );
}
