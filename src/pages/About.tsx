import React from "react";
import { Lightbulb, Users, Target } from "lucide-react";

const About: React.FC = () => {
    return (
        <section className="py-5 bg-light min-vh-100">
            <div className="container py-5">
                <div className="text-center mt-5">
                    <h2 className="fw-bold display-5 mb-3">About iScholar</h2>
                    <p className="text-muted fs-5 mx-auto" style={{ maxWidth: "700px" }}>
                        iScholar is an intelligent scholarship prequalification system designed to simplify the
                        scholarship application process for students. Using data-driven decision-making and fuzzy
                        logic, it helps identify eligible applicants quickly, fairly, and efficiently.
                    </p>
                </div>

                <div className="row g-4 mb-5">
                    {/* Mission */}
                    <div className="col-md-4">
                        <div className="card h-100 shadow-sm border-0 text-center">
                            <div className="card-body p-4">
                                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                     style={{ width: "70px", height: "70px" }}>
                                    <Target className="text-primary" size={32} />
                                </div>
                                <h5 className="card-title fw-bold mb-3">Our Mission</h5>
                                <p className="card-text text-muted">
                                    To promote equal access to educational opportunities by streamlining scholarship
                                    qualification through intelligent evaluation and automation.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Vision */}
                    <div className="col-md-4">
                        <div className="card h-100 shadow-sm border-0 text-center">
                            <div className="card-body p-4">
                                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                     style={{ width: "70px", height: "70px" }}>
                                    <Lightbulb className="text-primary" size={32} />
                                </div>
                                <h5 className="card-title fw-bold mb-3">Our Vision</h5>
                                <p className="card-text text-muted">
                                    To be the leading intelligent platform that bridges deserving students and available
                                    scholarships through innovation, transparency, and technology.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Team */}
                    <div className="col-md-4">
                        <div className="card h-100 shadow-sm border-0 text-center">
                            <div className="card-body p-4">
                                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                     style={{ width: "70px", height: "70px" }}>
                                    <Users className="text-primary" size={32} />
                                </div>
                                <h5 className="card-title fw-bold mb-3">Who We Are</h5>
                                <p className="card-text text-muted">
                                    We are a team of educators, developers, and innovators dedicated to helping students
                                    achieve their academic dreams through smart, accessible technology.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="card shadow-sm border-0">
                    <div className="card-body p-5">
                        <div className="row text-center g-4">
                            <div className="col-6 col-md-3">
                                <h3 className="display-4 fw-bold text-primary mb-2">47+</h3>
                                <p className="text-muted mb-0">Scholarships Supported</p>
                            </div>
                            <div className="col-6 col-md-3">
                                <h3 className="display-4 fw-bold text-primary mb-2">1K+</h3>
                                <p className="text-muted mb-0">Applications Processed</p>
                            </div>
                            <div className="col-6 col-md-3">
                                <h3 className="display-4 fw-bold text-primary mb-2">98%</h3>
                                <p className="text-muted mb-0">Automation Accuracy</p>
                            </div>
                            <div className="col-6 col-md-3">
                                <h3 className="display-4 fw-bold text-primary mb-2">24/7</h3>
                                <p className="text-muted mb-0">Smart Evaluation System</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;