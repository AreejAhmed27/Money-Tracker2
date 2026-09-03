import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Uploads all local financial data to the user's cloud Firestore document.
 */
export async function syncLocalDataToCloud(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const payload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
      timestamp: Date.now(),
    };

    // Gather all local storage keys starting with pf_ or custom_categories
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('pf_') || key.startsWith('custom_categories'))) {
        const val = localStorage.getItem(key);
        if (val !== null) {
          try {
            payload[key] = JSON.parse(val);
          } catch {
            payload[key] = val;
          }
        }
      }
    }

    const userDocRef = doc(db, 'users', userId, 'financial_data', 'ledger_backup');
    await setDoc(userDocRef, payload, { merge: true });
    return true;
  } catch (error) {
    console.error('Error syncing local data to cloud:', error);
    throw error;
  }
}

/**
 * Downloads cloud Firestore data and saves it to localStorage.
 */
export async function syncCloudDataToLocal(userId: string): Promise<{ success: boolean; itemCount: number }> {
  if (!userId) return { success: false, itemCount: 0 };
  try {
    const userDocRef = doc(db, 'users', userId, 'financial_data', 'ledger_backup');
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      return { success: false, itemCount: 0 };
    }

    const data = docSnap.data();
    let restoredCount = 0;

    Object.keys(data).forEach((key) => {
      if (key.startsWith('pf_') || key.startsWith('custom_categories')) {
        const val = data[key];
        if (val !== undefined && val !== null) {
          localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
          restoredCount++;
        }
      }
    });

    return { success: true, itemCount: restoredCount };
  } catch (error) {
    console.error('Error syncing cloud data to local:', error);
    throw error;
  }
}
