import { useState } from "react";

const ApplicantionForm = () => {
  const [step, setStep] = useState("step1");

  return (
    <div className="container p-2">
      <div className="card">
        <div className="card-header border-bottom">
          <div className="nav nav-pills nav-justified flex-column flex-xl-row nav-wizard">
            <a
              className={`nav-item nav-link ${step === "step1" ? "active" : ""}`}
              onClick={() => setStep("step1")}
            >
              <div className="wizard-step-icon">1</div>
              <div className="wizard-step-text">
                <div className="wizard-step-text-name">Account Setup</div>
                <div className="wizard-step-text-details">Basic details and information</div>
              </div>
            </a>
            <a
              className={`nav-item nav-link ${step === "step2" ? "active" : ""}`}
              onClick={() => setStep("step2")}
            >
              <div className="wizard-step-icon">2</div>
              <div className="wizard-step-text">
                <div className="wizard-step-text-name">Billing Details</div>
                <div className="wizard-step-text-details">Credit card information</div>
              </div>
            </a>
            <a
              className={`nav-item nav-link ${step === "step3" ? "active" : ""}`}
              onClick={() => setStep("step3")}
            >
              <div className="wizard-step-icon">3</div>
              <div className="wizard-step-text">
                <div className="wizard-step-text-name">Preferences</div>
                <div className="wizard-step-text-details">Notification and account options</div>
              </div>
            </a>
            <a
              className={`nav-item nav-link ${step === "step4" ? "active" : ""}`}
              onClick={() => setStep("step4")}
            >
              <div className="wizard-step-icon">4</div>
              <div className="wizard-step-text">
                <div className="wizard-step-text-name">Review & Submit</div>
                <div className="wizard-step-text-details">Review and submit changes</div>
              </div>
            </a>
          </div>
        </div>
        <div className="card-body">
          {step === "step1" && (
            <div>
              <h3 className="text-primary">Step 1</h3>
              <h5 className="card-title mb-4">Enter your account information</h5>
              <form>
                <div className="mb-3">
                  <label>Username</label>
                  <input className="form-control" type="text" placeholder="Enter your username" defaultValue="username" />
                </div>
                <div className="row gx-3">
                  <div className="mb-3 col-md-6">
                    <label>First name</label>
                    <input className="form-control" type="text" placeholder="First name" defaultValue="Valerie" />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label>Last name</label>
                    <input className="form-control" type="text" placeholder="Last name" defaultValue="Luna" />
                  </div>
                </div>
                <div className="row gx-3">
                  <div className="mb-3 col-md-6">
                    <label>Organization name</label>
                    <input className="form-control" type="text" placeholder="Org name" defaultValue="Start Bootstrap" />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label>Location</label>
                    <input className="form-control" type="text" placeholder="Location" defaultValue="San Francisco, CA" />
                  </div>
                </div>
                <div className="mb-3">
                  <label>Email</label>
                  <input className="form-control" type="email" placeholder="Email" defaultValue="name@example.com" />
                </div>
                <div className="row gx-3">
                  <div className="col-md-6">
                    <label>Phone</label>
                    <input className="form-control" type="tel" placeholder="Phone" defaultValue="555-123-4567" />
                  </div>
                  <div className="col-md-6">
                    <label>Birthday</label>
                    <input className="form-control" type="text" placeholder="Birthday" defaultValue="06/10/1988" />
                  </div>
                </div>
                <div className="d-flex justify-content-between mt-4">
                  <button className="btn btn-light disabled" disabled>Previous</button>
                  <button className="btn btn-primary" type="button" onClick={() => setStep("step2")}>Next</button>
                </div>
              </form>
            </div>
          )}

          {step === "step2" && (
            <div>
              <h3 className="text-primary">Step 2</h3>
              <h5 className="card-title mb-4">Enter your billing details</h5>
              <form>
                <div className="row gx-3">
                  <div className="mb-3 col-md-6">
                    <label>Name on card</label>
                    <input className="form-control" type="text" defaultValue="Valerie Luna" />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label>Card number</label>
                    <input className="form-control" type="text" defaultValue="4444 3333 2222 1111" />
                  </div>
                </div>
                <div className="row gx-3">
                  <div className="col-md-4">
                    <label>Expiry month</label>
                    <input className="form-control" type="text" defaultValue="06" />
                  </div>
                  <div className="col-md-4">
                    <label>Expiry year</label>
                    <input className="form-control" type="text" defaultValue="2024" />
                  </div>
                  <div className="col-md-4">
                    <label>CVV</label>
                    <input className="form-control" type="password" defaultValue="111" />
                  </div>
                </div>
                <div className="d-flex justify-content-between mt-4">
                  <button className="btn btn-light" type="button" onClick={() => setStep("step1")}>Previous</button>
                  <button className="btn btn-primary" type="button" onClick={() => setStep("step3")}>Next</button>
                </div>
              </form>
            </div>
          )}

          {step === "step3" && (
            <div>
              <h3 className="text-primary">Step 3</h3>
              <h5 className="card-title mb-4">Choose when to receive notifications</h5>
              <form>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" defaultChecked id="check1" />
                  <label className="form-check-label" htmlFor="check1">Account changes</label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" defaultChecked id="check2" />
                  <label className="form-check-label" htmlFor="check2">Group changes</label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" defaultChecked id="check3" />
                  <label className="form-check-label" htmlFor="check3">Product updates</label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" defaultChecked id="check4" />
                  <label className="form-check-label" htmlFor="check4">New product info</label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="check5" />
                  <label className="form-check-label" htmlFor="check5">Promotions</label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" disabled defaultChecked id="check6" />
                  <label className="form-check-label" htmlFor="check6">Security alerts</label>
                </div>
                <div className="d-flex justify-content-between mt-4">
                  <button className="btn btn-light" type="button" onClick={() => setStep("step2")}>Previous</button>
                  <button className="btn btn-primary" type="button" onClick={() => setStep("step4")}>Next</button>
                </div>
              </form>
            </div>
          )}

          {step === "step4" && (
            <div>
              <h3 className="text-primary">Step 4</h3>
              <h5 className="card-title mb-4">Review and submit</h5>
              <div className="row small text-muted">
                <div className="col-sm-3">Username:</div>
                <div className="col">username</div>
              </div>
              <div className="row small text-muted">
                <div className="col-sm-3">Name:</div>
                <div className="col">Valerie Luna</div>
              </div>
              <div className="row small text-muted">
                <div className="col-sm-3">Organization:</div>
                <div className="col">Start Bootstrap</div>
              </div>
              <div className="row small text-muted">
                <div className="col-sm-3">Location:</div>
                <div className="col">San Francisco, CA</div>
              </div>
              <div className="row small text-muted">
                <div className="col-sm-3">Email:</div>
                <div className="col">name@example.com</div>
              </div>
              <div className="row small text-muted">
                <div className="col-sm-3">Phone:</div>
                <div className="col">555-123-4567</div>
              </div>
              <div className="row small text-muted">
                <div className="col-sm-3">Birthday:</div>
                <div className="col">06/10/1988</div>
              </div>
              <div className="row small text-muted">
                <div className="col-sm-3">Card:</div>
                <div className="col">**** **** **** 1111</div>
              </div>
              <div className="row small text-muted">
                <div className="col-sm-3">Expires:</div>
                <div className="col">06/2024</div>
              </div>
              <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-light" type="button" onClick={() => setStep("step3")}>Previous</button>
                <button className="btn btn-primary" type="submit">Submit</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantionForm;
