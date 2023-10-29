let isVerified = false;
document.getElementById('sendCodeBtn').addEventListener('click', function () {
    const email = document.getElementById('email').value;
    if (email) {
        fetch('/auth/sendcode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        })
        
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                alert('인증 코드가 발송되었습니다.');
            })
            .catch(err => {
                alert('오류가 발생했습니다. 다시 시도해주세요.');
            });
    } else {
        alert('이메일 주소를 입력하세요.');
    }
});

document.getElementById('verifyCodeBtn').addEventListener('click', function () {
    const email = document.getElementById('email').value;
    const code = document.getElementById('verificationCode').value;
    if (email && code) {
        fetch('/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, code})
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
            .then(data => {
                if (data.success) {
                    isVerified = true;
                    document.getElementById('signupBtn').disabled = false;
                    alert('인증 성공');
                } else {
                    isVerified = false;
                    alert('인증 실패');
                }
            })
            .catch(err => {
                console.error(err);
                alert('인증 실패');
            });
    } else {
        alert('이메일과 인증 코드를 입력하세요.');
    }
});
