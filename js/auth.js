//Login Page



let currentTab = 'login'

const formContainer= document.querySelector('.auth__form')

 
 
 const authTypeDiv = document.querySelector('.auth__type');
 const changeTab = document.querySelectorAll('.change__tab')
 
 let allInput = formContainer.querySelectorAll('input');
 
// BUSINESS LOGIC

// Switch Tab - Login or Signup

authTypeDiv.addEventListener('click', (e) => {
  if(!e.target.dataset.tab) return
  authTypeDiv.querySelectorAll('h3').forEach(el => el.classList.remove('active'))
  e.target.classList.toggle('active')
  currentTab = e.target.dataset.tab
  displayForm(currentTab)
 
})

changeTab.forEach(
  el => {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      currentTab = e.target.dataset.tab
   displayForm(currentTab)
   
   authTypeDiv.querySelectorAll('h3').forEach(el => el.classList.remove('active'))
  authTypeDiv.querySelector(`[data-tab = ${currentTab}]`).classList.toggle('active')
  
   
    }
   )
  }
)


//Change Form Display - Login or Signup
      
function displayForm(tab) {
  let markup = '';
  
  
  if(tab === 'signup' ) {
    markup = `<div class="input__div">
        <label for="">
        Full Name:
      </label>
      <input type="text" name="fullname" id="" value="" />
      <p class="error_message"></p>
</div>

<div class="input__div">
        <label for="">
        Email:
      </label>
      <input type="email" name="email" id="" value="" />
      <p class="error_message"></p>
</div>
      

      
<div class="input__div">
  <label for="">
    Password:
  </label>
<div class="password__input">
    <input type="password" name="password" id="" value="" />
<span><svg class='show__off_password' width="14" height="14"><use href="/images/icons.svg#icon-eye-off"></use></svg>
    </span>
</div>
  <p class="error_message"></p>
</div>
      
      <button type="submit">Sign Up</button>
              
      <p  class="ask__authType">Already have an account? <a data-tab="login" class="change__tab" href="">Login</a></p>
      `
      
      
  }
  
  if(tab === 'login' ) {
    markup =  `
<div class="input__div">
        <label for="">
        Email:
      </label>
      <input type="email" name="email" id="email" value="" />
        <p class="error_message"></p>
</div>
      
<div class="input__div">
  <label for="">
    Password:
  </label>
<div class="password__input">
    <input type="password" name="password" id="password" value="" />
<span><svg width="14" height="14"><use href="/images/icons.svg#icon-eye-off"></use></svg>
    </span>
</div>
  <p class="error_message"></p>
</div>
      
      <button type="submit">Login</button>
      
          <p class="ask__authType">Don't have an account? <a data-tab="signup" class="change__tab" href="">Sign Up</a></p>
      
      `
  }
  
  formContainer.innerHTML = markup
  allInput = formContainer.querySelectorAll('input');

}


function  validateInput(input) {
  if (input.value === '') {
    input.closest('.input__div').querySelector('.error_message').innerHTML = 'Input is required'
  } else {
    input.closest('.input__div').querySelector('.error_message').innerHTML = ''
  }
}

function checkallInputField(...inputArr) {
  const inputsArrFilledStatus = inputArr.map(i => i.value !== '')
  console.log(inputsArrFilledStatus)
  
  return inputArr.every(i => i.value !== '')
}



allInput.forEach(
  input => {
    input.addEventListener('input', (e) => {
      validateInput(e.target)
    })
  }
)

class User {
  #password;
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.#password = password
  }
  
  logUser(){
    const a = document.createElement('a')
a.href = 'index.html';
a.click();
    console.log(`Welcome ${this.name}, your email is ${this.email} with password: ${this.#password}`)
  }
  
  confirmLoginDetails(inputEmail, inputPassword){
    return inputEmail === this.email && inputPassword === this.#password
  }
}

let user;

async function createNewAccount(inputArr) {
  try {
    console.log(inputArr)
  const inputsArr = [...inputArr]
  console.log(inputsArr)
  
  const nameInput = inputsArr.find(i => i.name === 'fullname');
  const emailInput = inputsArr.find(i => i.name === 'email');
  const passwordInput = inputsArr.find(i => i.name === 'password');
  
  console.log(nameInput.value, emailInput.value, passwordInput)
  
  const userName =nameInput.value;
  const userPassword =passwordInput.value;
  const userEmail =emailInput.value.trim()
  
  const {data, error} = await supabaseClient.auth.signUp({
    email: userEmail,
      password: userPassword,
      options: {data : {userName}}
  }
      
  ) 
  
  if(data.user){
    alert('account created')
  }
  
  if(error) {
    alert('Error ❗❗❗❗❗')
    throw error
  }
  
  return data
  } catch (e) {
    console.error(e)
  }

}


async function logInUser(...inputArr) {
  const inputsArr = inputArr
  console.log(inputArr, '❗❗❗❗❗❗')
  
  
  const emailInput = inputsArr.find(i => i.name === 'email');
  const passwordInput = inputsArr.find(i => i.name === 'password');
console.log(emailInput, passwordInput)
  
  const userPassword =passwordInput.value;
  const userEmail =emailInput.value.trim()
  
  console.log(userPassword, userEmail)
  
  const {data, error} = await supabaseClient.auth.signInWithPassword({email: userEmail,password: userPassword})
  
  console.log(data, error)
  if(error){
    loginError.innerHTML = error.code
  }
  
  if(!data.user) return true;
  return true
}


const loginError = document.querySelector('.general__error');

formContainer.addEventListener('input', (e)=>{
  allInput.forEach(i => validateInput(i))
})


formContainer.addEventListener('submit', (e) => {
  e.preventDefault()
 allInput.forEach(i => validateInput(i))
 
 if (checkallInputField(...allInput)) {
    if(currentTab === 'signup'){
      const ok = createNewAccount(allInput)
      if(ok){
      alert('Account created successful')
      console.log(allInput)
      // goToApp()
      }
    }
  
    if(currentTab === 'login'){
      const emailInput = document.getElementById('email')
      const passwordInput = document.getElementById('password')
      console.log(emailInput, passwordInput)
      const ok = logInUser(emailInput, passwordInput)
      
      if(ok){
        alert('User Found🤞')
      } else {
        alert('User not found ❗')
      }
      
      // if(!user) loginError.innerHTML = 'Account not found'
      // if(!user) return
       
    
      // if (user.confirmLoginDetails(emailInput.value, passwordInput.value)){
      //   user.logUser()
      // } else{
      //   loginError.innerHTML = 'Wrong Email or password!'
      // }
      // loginError.innerHTML  = 'Login'
      
    }
   
 }
 
 
 
})

function storeToLocalStorage(data) {
  localStorage.setItem('user', JSON.stringify(data))
}

function getDataLocalStorage() {
  return JSON.parse(localStorage.getItem('user'))
}

window.addEventListener('load', ()=>{
  user = getDataLocalStorage() || ''
  console.log(user, 'ndndndndn')
})

// Show password
let show = false;
function showPass(show) {
  console.log(document.querySelector('.password__input').querySelector('use'))
  if(show){
    document.querySelector('.password__input').querySelector('input').type = 'text';
       document.querySelector('.password__input').querySelector('svg').innerHTML =`<use href="/images/icons.svg#icon-eye"></use>`
  }else{
    document.querySelector('.password__input').querySelector('input').type = 'password';
document.querySelector('.password__input').querySelector('svg').innerHTML= '<use href="/images/icons.svg#icon-eye-off"></use>'
  }
} 
  
formContainer.addEventListener('click', (e)=>{
  if (!e.target.closest('.password__input')) return 
  console.log(e.target)
  
  show = !show
showPass(show)
  
}

)





async function signUp(email, password, name) {
  const { data, error } = await supabase2.auth.signUp({
    email,
    password,
    options: {
      data: { name } // stored as user metadata
    }
  });
  if (error) throw error;
  return data;
}

async function login(email, password) {
  const { data, error } = await supabase2.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data; // includes session + JWT
}

// Get current logged-in user
// const { data: { user } } = await supabase2.auth.getUser();

// Log out
// await supabase.auth.signOut();

// Listen for auth state changes (login/logout across tabs, token refresh)


function LogUserInToQuiz() {
    window.location.replace('index.html')
}




supabaseClient.auth.onAuthStateChange((event, session) => {
  // console.log(event, session);
  if(event === 'SIGNED_IN') {
    LogUserInToQuiz()
    isLoggedIn = true;
  }
});

