// ==========================================
// 📅 ໂມດູນຈັດການ ແລະ ເບິ່ງຕາຕະລາງຮຽນ (timetable.js)
// ==========================================

import { db } from "./script.js"; // ດຶງຄ່າ db ມາຈາກ script.js (ຖ້າໃຊ້ Module)
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1. ບັນທຶກ ຫຼື ເພີ່ມ/ແກ້ໄຂ ຕາຕະລາງຮຽນລົງ Firebase Firestore
window.saveTimetableData = async function(event) {
    if (event) event.preventDefault();

    const docId = document.getElementById('timetable-doc-id').value;
    const room = document.getElementById('timetable-class-room').value;
    const subject = document.getElementById('timetable-subject').value;
    const day = document.getElementById('timetable-day').value;
    const time = document.getElementById('timetable-time').value;
    const teacher = document.getElementById('timetable-teacher').value;

    if (!room || !subject || !day || !time || !teacher) {
        alert('⚠️ ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບຖ້ວນ!');
        return;
    }

    try {
        if (docId) {
            await updateDoc(doc(db, "timetables", docId), { room, subject, day, time, teacher });
            alert('✅ ແກ້ໄຂຕາຕະລາງຮຽນສຳເລັດ!');
        } else {
            await addDoc(collection(db, "timetables"), {
                room, subject, day, time, teacher,
                createdAt: serverTimestamp()
            });
            alert('✅ ເພີ່ມຕາຕະລາງຮຽນສຳເລັດ!');
        }

        document.getElementById('timetable-form').reset();
        document.getElementById('timetable-doc-id').value = '';
        resetTimetableForm();
        loadTimetables();
    } catch (error) {
        console.error("Error saving timetable: ", error);
        alert('❌ ບັນທຶກບໍ່ສຳເລັດ: ' + error.message);
    }
};

// 2. ຟັງຊັ່ນໂຫຼດ ແລະ ສະແດງຕາຕະລາງຮຽນໃນໜ້າເວັບ
window.loadTimetables = async function() {
    const tbody = document.getElementById('timetable-table-body');
    if (!tbody) return;

    try {
        const querySnapshot = await getDocs(collection(db, "timetables"));
        let html = '';
        const userRole = localStorage.getItem('userRole') || 'student';
        const canManage = (userRole === 'admin' || userRole === 'teacher');

        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 15px; color: #666;">ບໍ່ມີຂໍ້ມູນຕາຕະລາງຮຽນ</td></tr>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const id = docSnap.id;
            html += `
                <tr>
                    <td style="font-weight: bold; color: #007bff;">${item.room || ''}</td>
                    <td>${item.subject || ''}</td>
                    <td>${item.day || ''}</td>
                    <td>${item.time || ''}</td>
                    <td>${item.teacher || ''}</td>
                    <td style="text-align: center;">
                        ${canManage ? `
                            <button type="button" onclick="editTimetable('${id}', '${item.room || ''}', '${item.subject || ''}', '${item.day || ''}', '${item.time || ''}', '${item.teacher || ''}')" style="background: #ffc107; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;" title="ແກ້ໄຂ">✏️</button>
                            <button type="button" onclick="deleteTimetable('${id}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;" title="ລົບ">🗑️</button>
                        ` : '<span style="color: #888; font-size: 12px;">ເບິ່ງຢ່າງດຽວ</span>'}
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (error) {
        console.error("Error loading timetables: ", error);
    }
};

// 3. ນຳຂໍ້ມູນມາວາງໃສ່ຟອມເພື່ອແກ້ໄຂ
window.editTimetable = function(id, room, subject, day, time, teacher) {
    document.getElementById('timetable-doc-id').value = id;
    document.getElementById('timetable-class-room').value = room;
    document.getElementById('timetable-subject').value = subject;
    document.getElementById('timetable-day').value = day;
    document.getElementById('timetable-time').value = time;
    document.getElementById('timetable-teacher').value = teacher;

    document.getElementById('class-form-title').innerText = '✏️ ແກ້ໄຂຕາຕະລາງຮຽນ';
    document.getElementById('save-timetable-btn').innerText = '💾 ບັນທຶກການແກ້ໄຂ';
    document.getElementById('cancel-timetable-edit-btn').style.display = 'inline-block';
};

// 4. ລົບຕາຕະລາງຮຽນ
window.deleteTimetable = async function(id) {
    if (confirm('⚠️ ທ່ານຕ້ອງການລົບຕາຕະລາງນີ້ແທ້ບໍ?')) {
        try {
            await deleteDoc(doc(db, "timetables", id));
            alert('🗑️ ລົບສຳເລັດ!');
            loadTimetables();
        } catch (error) {
            console.error("Error deleting timetable: ", error);
        }
    }
};

// 5. ຣີເຊັດຟອມ
window.resetTimetableForm = function() {
    const form = document.getElementById('timetable-form');
    if (form) form.reset();
    document.getElementById('timetable-doc-id').value = '';
    document.getElementById('class-form-title').innerText = '➕ ເພີ່ມຕາຕະລາງຮຽນໃໝ່';
    document.getElementById('save-timetable-btn').innerText = '💾 ບັນທຶກຕາຕະລາງ';
    document.getElementById('cancel-timetable-edit-btn').style.display = 'none';
};

// 6. ເອີ້ນໂຫຼດຂໍ້ມູນຕອນເປີດໜ້າເວັບ
window.addEventListener('DOMContentLoaded', () => {
    if (typeof loadTimetables === 'function') {
        loadTimetables();
    }
});
