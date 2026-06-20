'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '../../providers/FamilyProvider';
import { useAuth } from '../../providers/AuthProvider';
import { MockMapPicker } from '../../components/MockMapPicker';
import { Plus, Trash2, ArrowRight, ArrowLeft, TreePine, Sparkles } from 'lucide-react';
import { AgeGroup, VehicleType } from '../../types';

export default function Onboarding() {
  const router = useRouter();
  const { setupFamily } = useFamily();
  const { loginAs } = useAuth();

  const [step, setStep] = useState(1);

  // Step 1 states
  const [familyName, setFamilyName] = useState('Green Family');
  const [cityId, setCityId] = useState('mumbai');
  const [neighbourhoodId, setNeighbourhoodId] = useState('mum_bandra');
  const [goalPercent, setGoalPercent] = useState<number>(20);

  // Step 2 states
  const [members, setMembers] = useState<Array<{ name: string; ageGroup: AgeGroup; role: string }>>(
    [
      { name: 'Hrushikesh', ageGroup: 'adult', role: 'Father' },
      { name: 'Nakshatra', ageGroup: 'adult', role: 'Mother' },
      { name: 'Shreyas', ageGroup: 'teen', role: 'Son' },
      { name: 'Anika', ageGroup: 'child', role: 'Daughter' },
    ]
  );
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAgeGroup, setNewMemberAgeGroup] = useState<AgeGroup>('adult');
  const [newMemberRole, setNewMemberRole] = useState('');

  // Step 3 states
  const [vehicles, setVehicles] = useState<Array<{ type: VehicleType; label: string }>>([
    { type: 'petrol', label: 'Creta SUV' },
    { type: 'ev', label: 'Ather 450X' },
  ]);
  const [newVehicleType, setNewVehicleType] = useState<VehicleType>('petrol');
  const [newVehicleLabel, setNewVehicleLabel] = useState('');

  // Handlers
  const addMember = () => {
    if (!newMemberName || !newMemberRole) return;
    setMembers([
      ...members,
      { name: newMemberName, ageGroup: newMemberAgeGroup, role: newMemberRole },
    ]);
    setNewMemberName('');
    setNewMemberRole('');
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const addVehicle = () => {
    if (!newVehicleLabel) return;
    setVehicles([...vehicles, { type: newVehicleType, label: newVehicleLabel }]);
    setNewVehicleLabel('');
  };

  const removeVehicle = (index: number) => {
    setVehicles(vehicles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!familyName.trim() || members.length === 0) return;

    // Set up the family data locally
    setupFamily(familyName, cityId, neighbourhoodId, goalPercent, members, vehicles);

    // Log in as first adult by default
    const firstAdult = members.find((m) => m.ageGroup === 'adult') || members[0];
    loginAs(firstAdult.role);

    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-card-tint-mint flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="flex justify-center text-forest-green mb-3">
          <TreePine className="w-12 h-12 stroke-[2]" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Create your Family Hub
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Step {step} of 3 — Let's customize your ZeroRoute experience
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-card-tint-yellow py-8 px-4 shadow-sm rounded-xl border border-hairline sm:px-10 space-y-6">
          {/* STEP 1: Basic Family Info & Location */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Family Name</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full mt-1 notion-input font-sans text-sm"
                  placeholder="e.g., Sharma Family, Green Household"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reduction Goal (Weekly Target)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[10, 20, 30].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setGoalPercent(val)}
                      className={`py-3 px-4 text-center rounded-lg border font-semibold text-sm transition-all ${
                        goalPercent === val
                          ? 'border-forest-green bg-emerald-100/80 text-forest-green'
                          : 'border-[#e5e3df] text-slate-600 hover:bg-white/40'
                      }`}
                    >
                      {val}% Reduction
                    </button>
                  ))}
                </div>
                <p className="text-xxs text-slate-500 mt-2">
                  Select a realistic carbon reduction target compared to your baseline.
                </p>
              </div>

              <div>
                <MockMapPicker
                  selectedCityId={cityId}
                  selectedNeighbourhoodId={neighbourhoodId}
                  onSelect={(cId, nId) => {
                    setCityId(cId);
                    setNeighbourhoodId(nId);
                  }}
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={!familyName.trim()}
                  className="notion-btn-dark bg-forest-green hover:bg-emerald-800 text-white flex items-center gap-2"
                >
                  Configure Members <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Add Family Members */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Family Members</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Each member will receive customized weekly goals based on their age group.
                </p>

                {/* Form to add single member */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-white/40 border border-hairline rounded-lg mb-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="notion-input w-full text-xs bg-white/80"
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. Aunt, Son)"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="notion-input w-full text-xs bg-white/80"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newMemberAgeGroup}
                      onChange={(e) => setNewMemberAgeGroup(e.target.value as AgeGroup)}
                      className="notion-input w-full text-xs bg-white/80"
                    >
                      <option value="adult">Adult (18+)</option>
                      <option value="teen">Teen (12-18)</option>
                      <option value="child">Child (Under 12)</option>
                    </select>
                    <button
                      type="button"
                      onClick={addMember}
                      className="bg-forest-green text-white p-2 rounded-lg hover:bg-emerald-800 flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* List of currently added members */}
                <div className="space-y-2">
                  {members.map((member, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border border-hairline rounded-lg bg-white/60"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 text-sm">{member.name}</span>
                        <span className="text-xs text-slate-500 ml-2">
                          ({member.role} - {member.ageGroup})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {members.length === 0 && (
                    <p className="text-sm text-amber-600 text-center py-4">
                      Add at least one family member to continue.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="notion-btn-secondary flex items-center gap-2 hover:bg-white/40"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={members.length === 0}
                  className="notion-btn-dark bg-forest-green hover:bg-emerald-800 text-white flex items-center gap-2"
                >
                  Configure Vehicles <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Add Vehicles */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Family Vehicles (Optional)</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Registering vehicles lets us assign specific carbon factors for calculations (EVs
                  get the ⚡ badge!).
                </p>

                {/* Form to add vehicle */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-white/40 border border-hairline rounded-lg mb-4">
                  <input
                    type="text"
                    placeholder="Vehicle Name (e.g. Civic, Activa)"
                    value={newVehicleLabel}
                    onChange={(e) => setNewVehicleLabel(e.target.value)}
                    className="notion-input w-full text-xs col-span-2 bg-white/80"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newVehicleType}
                      onChange={(e) => setNewVehicleType(e.target.value as VehicleType)}
                      className="notion-input w-full text-xs bg-white/80"
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="cng">CNG</option>
                      <option value="ev">Electric Vehicle (EV)</option>
                    </select>
                    <button
                      type="button"
                      onClick={addVehicle}
                      className="bg-forest-green text-white p-2 rounded-lg hover:bg-emerald-800 flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* List of currently added vehicles */}
                <div className="space-y-2">
                  {vehicles.map((v, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border border-hairline rounded-lg bg-white/60"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 text-sm">{v.label}</span>
                        <span className="text-xs uppercase font-bold text-slate-500 ml-2 bg-slate-100 px-2 py-0.5 rounded">
                          {v.type}
                        </span>
                        {v.type === 'ev' && <span className="ml-2 text-xs">⚡</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVehicle(index)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {vehicles.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No vehicles registered. (All road trips will use default petrol factors).
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="notion-btn-secondary flex items-center gap-2 hover:bg-white/40"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="notion-btn-primary bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Enter Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
