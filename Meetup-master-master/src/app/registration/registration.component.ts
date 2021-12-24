import { Attribute, Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Employee } from '../model/employee';
import { EmployeeService } from '../services/employee.service';
import { MenuComponent } from '../menu/menu.component';
import { Address } from '../model/address';
import { UsersComponent } from '../users/users.component';
import { ToastrComponentlessModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
  providers:[]
})

export class RegistrationComponent implements OnInit {
  employee:Employee;
  form: FormGroup;
  countryArr: any;
  stateArr: any;
  cityArr: any;
  submitted = false;
  isLoggedIn:boolean;
  required:any;
  isAdmin:boolean=false;
  countryId:String;
  

  constructor(
    private employeeService:EmployeeService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { }
  
  ngOnInit(): void {
   
    this.getCountries();
    this.isLoggedIn=this.employeeService.isUserLoggedIn();
    //this.required=this.isLoggedIn?Validators.nullValidator:Validators.required;
    this.form = this.formBuilder.group({
      address: this.formBuilder.group({
       streetName:[''],
      city:[''],
      state:[''],
      country:[''],
      zipCode:[''],
      }),
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email:['', [Validators.email,Validators.required]],
      mobileNumber:['',[Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      company:[''],
      designation:[''],
      dateofBirth:[''],
      userName: new FormControl({value: '', disabled: this.isLoggedIn?true:false}, Validators.required),
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword:['',this.isLoggedIn?Validators.nullValidator:Validators.required],
    }
    ,{ 
      // here we attach our form validator
    
      validators:this.controlsEqual('confirmPassword', 'password')

    });
    if (this.isLoggedIn) {

      // this.form.get("userName").disable();
      //this.employee=this.employeeService.getEditEmployee()
      this.isAdmin=this.employeeService.isAdmin();
      if(this.isAdmin){
        console.log(this.employeeService.getEditEmployee())
        this.form.patchValue(this.employeeService.getEditEmployee());
      }
      else{
       this.employeeService.getUserByName().subscribe(x => this.form.patchValue(x));
      }
 
   }
}
 controlsEqual(
  controlName: string,
  equalToName: string,
  errorKey: string = controlName // here you can customize validation error key 
) {

  return (form: FormGroup) => {
    const control = form.get(controlName);
    if(form.get('password').dirty){
    if (control.value !== form.get(equalToName).value) {
      control.setErrors({ [errorKey]: true });
      return {
        [errorKey]: true
      }
    } else {
      control.setErrors(null);
      return null
    } 
  }
}
}

  get f() { return this.form.controls; }

  addUser() {
    this.employeeService.addEmployee(this.employee).subscribe(
      data=>{
        if(data==null){
          this.toastr.warning("Username is already taken");
        }
        else{
        console.log('from post method');
        console.log(data);
       this.toastr.success("Registered successfully");
       this.router.navigate(['/login']);
        }
      }
    );
   

  }

  editUser(){
      this.employeeService.editUser(this.employee).subscribe(

        data=>{
     
          console.log(data);
     
        this.toastr.success("Updated details successfully");

     
        this.router.navigate(["../users"]);
     
        },
     
        error=>{
     
          console.log(error.error);
     
        }
     
      );
 }

  onSubmit(){
    this.submitted = true;
    console.log(this.form.controls.STATUS);

    if(this.form.valid){

      if(this.form.controls.userName.value=="admin"){
        this.toastr.warning("Username cannot be 'admin'");
        return "";
      }
      console.log(this.form.value)
      console.log(this.form.get("userName").value)
      this.employee=Object.assign({},this.form.value);
      this.employee.address=Object.assign({},this.employee.address);
      if(this.isAdmin)
      this.employee.id=this.employeeService.editemployee.id;
      else{
        this.employee.id=this.employeeService.getLoggedInUserId();
      }
    if(this.isLoggedIn){
    console.log("Submitted");
    if(this.isAdmin)
      this.employee.userName=this.employeeService.editemployee.userName;
      else{
        this.employee.userName=this.employeeService.getLoggedInUserName();
      }
   
    this.editUser();
    }
    else
    this.addUser();
  }
}
 
 

  interpolate(){
    if(this.employeeService.isUserLoggedIn())
     return this.employeeService.getLoggedInUserName();
    else
     return "Username";
  }

  getCountries(){
    this.employeeService.getCountries().subscribe(data=>{
       this.countryArr=data;
    })
  }

  getStates(event){
    this.stateArr=this.countryArr[this.countryArr.findIndex(country=>country.name==event.target.value)].states;
  }

  getCities(event){
    var index = this.stateArr.findIndex(state => state.name==event.target.value);
    this.cityArr=this.stateArr[index].cities;
  }
  cancel(){
    alert("Do you want to leave?Changesyou have made will not be saved");
    this.router.navigate(['/home'])
   
  }

  

}
