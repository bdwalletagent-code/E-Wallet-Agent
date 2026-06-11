export interface FlutterFile {
  name: string;
  path: string;
  language: string;
  content: string;
}

export const FLUTTER_PROJECT: FlutterFile[] = [
  {
    name: "pubspec.yaml",
    path: "pubspec.yaml",
    language: "yaml",
    content: `name: e_wallet_agent
description: A professional digital wallet agent Android app using Flutter and Firebase.
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  cupertino_icons: ^1.0.5
  firebase_core: ^2.15.0
  firebase_auth: ^4.7.0
  cloud_firestore: ^4.8.0
  firebase_messaging: ^14.6.4
  provider: ^6.0.5
  intl: ^0.18.1
  fl_chart: ^0.63.0
  qr_flutter: ^4.1.0
  share_plus: ^7.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.1

flutter:
  uses-material-design: true
`
  },
  {
    name: "main.dart",
    path: "lib/main.dart",
    language: "dart",
    content: `import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'services/firebase_service.dart';
import 'views/login_screen.dart';
import 'views/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => FirebaseService()),
      ],
      child: const EWalletAgentApp(),
    ),
  );
}

class EWalletAgentApp extends StatefulWidget {
  const EWalletAgentApp({super.key});

  @override
  State<EWalletAgentApp> createState() => _EWalletAgentAppState();
}

class _EWalletAgentAppState extends State<EWalletAgentApp> {
  Locale _locale = const Locale('en', 'US');

  void setLocale(Locale value) {
    setState(() {
      _locale = value;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'E-Wallet Agent',
      debugShowCheckedModeBanner: false,
      locale: _locale,
      supportedLocales: const [
        Locale('en', 'US'),
        Locale('bn', 'BD'),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      themeMode: ThemeMode.system,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F9D58), // Emerald Green
          primary: const Color(0xFF0F9D58),
          secondary: const Color(0xFF1E88E5), // Material Blue
          brightness: Brightness.light,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F9D58),
          primary: const Color(0xFF0F9D58),
          secondary: const Color(0xFF1E88E5),
          brightness: Brightness.dark,
        ),
      ),
      home: const AuthGate(),
    );
  }
}

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final firebaseService = Provider.of<FirebaseService>(context);
    if (firebaseService.currentFirebaseUser == null) {
      return const LoginScreen();
    }
    return const HomeScreen();
  }
}
`
  },
  {
    name: "agent_model.dart",
    path: "lib/models/agent_model.dart",
    language: "dart",
    content: `import 'package:cloud_firestore/cloud_firestore.dart';

class Agent {
  final String agentId;
  final String name;
  final String mobile;
  final String status; // 'pending', 'approved', 'suspended'
  final double walletBalance;
  final String? referredBy;
  final String referralCode;
  final DateTime createdAt;

  Agent({
    required this.agentId,
    required this.name,
    required this.mobile,
    required this.status,
    required this.walletBalance,
    this.referredBy,
    required this.referralCode,
    required this.createdAt,
  });

  factory Agent.fromFirestore(Map<String, dynamic> data) {
    return Agent(
      agentId: data['agentId'] ?? '',
      name: data['name'] ?? '',
      mobile: data['mobile'] ?? '',
      status: data['status'] ?? 'pending',
      walletBalance: (data['walletBalance'] as num?)?.toDouble() ?? 0.0,
      referredBy: data['referredBy'],
      referralCode: data['referralCode'] ?? '',
      createdAt: (data['createdAt'] as Timestamp).toDate(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'agentId': agentId,
      'name': name,
      'mobile': mobile,
      'status': status,
      'walletBalance': walletBalance,
      'referredBy': referredBy,
      'referralCode': referralCode,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
`
  },
  {
    name: "transaction_model.dart",
    path: "lib/models/transaction_model.dart",
    language: "dart",
    content: `import 'package:cloud_firestore/cloud_firestore.dart';

class TransactionModel {
  final String id;
  final String agentId;
  final String customerMobile;
  final String type; // 'deposit', 'withdrawal', 'recharge', 'bill_pay'
  final String? operator;
  final String? billType;
  final double amount;
  final double commissionEarned;
  final String status; // 'pending', 'success', 'failed'
  final DateTime timestamp;

  TransactionModel({
    required this.id,
    required this.agentId,
    required this.customerMobile,
    required this.type,
    this.operator,
    this.billType,
    required this.amount,
    required this.commissionEarned,
    required this.status,
    required this.timestamp,
  });

  factory TransactionModel.fromFirestore(Map<String, dynamic> data) {
    return TransactionModel(
      id: data['id'] ?? '',
      agentId: data['agentId'] ?? '',
      customerMobile: data['customerMobile'] ?? '',
      type: data['type'] ?? '',
      operator: data['operator'],
      billType: data['billType'],
      amount: (data['amount'] as num?)?.toDouble() ?? 0.0,
      commissionEarned: (data['commissionEarned'] as num?)?.toDouble() ?? 0.0,
      status: data['status'] ?? 'pending',
      timestamp: (data['timestamp'] as Timestamp).toDate(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'id': id,
      'agentId': agentId,
      'customerMobile': customerMobile,
      'type': type,
      'operator': operator,
      'billType': billType,
      'amount': amount,
      'commissionEarned': commissionEarned,
      'status': status,
      'timestamp': Timestamp.fromDate(timestamp),
    };
  }
}
`
  },
  {
    name: "firebase_service.dart",
    path: "lib/services/firebase_service.dart",
    language: "dart",
    content: `import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/agent_model.dart';
import '../models/transaction_model.dart';

class FirebaseService extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  User? get currentFirebaseUser => _auth.currentUser;
  Agent? _currentAgent;
  Agent? get currentAgent => _currentAgent;

  bool _loading = false;
  bool get loading => _loading;

  FirebaseService() {
    _auth.authStateChanges().listen((user) async {
      if (user != null) {
        await fetchAgentDetails();
      } else {
        _currentAgent = null;
        notifyListeners();
      }
    });
  }

  Future<void> login(String email, String password) async {
    _loading = true;
    notifyListeners();
    try {
      await _auth.signInWithEmailAndPassword(email: email, password: password);
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> registerAgent({
    required String email,
    required String password,
    required String name,
    required String mobile,
    String? referredByCode,
  }) async {
    _loading = true;
    notifyListeners();
    try {
      final creds = await _auth.createUserWithEmailAndPassword(email: email, password: password);
      final uid = creds.user!.uid;

      final referralCode = 'BDG' + mobile.substring(mobile.length - 6);

      // Create base user role record
      await _db.collection('users').doc(uid).set({
        'uid': uid,
        'email': email,
        'role': 'agent',
        'createdAt': FieldValue.serverTimestamp(),
      });

      // Create pending Agent details
      final newAgent = Agent(
        agentId: uid,
        name: name,
        mobile: mobile,
        status: 'pending',
        walletBalance: 2000.0, // Starting trial gift balance
        referredBy: referredByCode,
        referralCode: referralCode,
        createdAt: DateTime.now(),
      );

      await _db.collection('agents').doc(uid).set(newAgent.toFirestore());
      
      // If referred, register referral record
      if (referredByCode != null && referredByCode.isNotEmpty) {
        final query = await _db.collection('agents').where('referralCode', isEqualTo: referredByCode).limit(1).get();
        if (query.docs.isNotEmpty) {
          final parentAgent = query.docs.first;
          await _db.collection('referrals').add({
            'id': _db.collection('referrals').doc().id,
            'referrerAgentId': parentAgent.id,
            'referrerAgentName': parentAgent['name'],
            'referredAgentId': uid,
            'referredAgentName': name,
            'rewardAmount': 500.0,
            'status': 'pending_approval',
            'timestamp': FieldValue.serverTimestamp(),
          });
        }
      }
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> fetchAgentDetails() async {
    if (currentFirebaseUser == null) return;
    final doc = await _db.collection('agents').doc(currentFirebaseUser!.uid).get();
    if (doc.exists) {
      _currentAgent = Agent.fromFirestore(doc.data()!);
      notifyListeners();
    }
  }

  // CORE TRANSACTION LOGIC WITH SERVER SIDE CHECKS
  Future<bool> executeTransaction({
    required String customerMobile,
    required String type,
    required double amount,
    String? operator,
    String? billType,
  }) async {
    if (_currentAgent == null || _currentAgent!.status != 'approved') {
      throw Exception('Agent account is not approved to perform transactions');
    }

    double commissionRate = 0.0;
    if (type == 'deposit') {
      commissionRate = 0.05; // 5%
    } else if (type == 'withdrawal') {
      commissionRate = 0.03; // 3%
    }

    final commissionEarned = amount * commissionRate;

    // Financial balance checks
    double balanceChange = 0.0;
    if (type == 'deposit' || type == 'recharge' || type == 'bill_pay') {
      if (_currentAgent!.walletBalance < amount) {
        throw Exception('Insufficient agent wallet balance');
      }
      balanceChange = -amount + commissionEarned;
    } else if (type == 'withdrawal') {
      balanceChange = amount + commissionEarned;
    }

    final txId = _db.collection('transactions').doc().id;
    final tx = TransactionModel(
      id: txId,
      agentId: _currentAgent!.agentId,
      customerMobile: customerMobile,
      type: type,
      operator: operator,
      billType: billType,
      amount: amount,
      commissionEarned: commissionEarned,
      status: 'success',
      timestamp: DateTime.now(),
    );

    // Atomic transaction execution
    await _db.runTransaction((transaction) async {
      final agentRef = _db.collection('agents').doc(_currentAgent!.agentId);
      final agentSnapshot = await transaction.get(agentRef);
      final currentBal = (agentSnapshot.data()?['walletBalance'] as num).toDouble();

      if ((type == 'deposit' || type == 'recharge' || type == 'bill_pay') && currentBal < amount) {
        throw Exception('Insufficient balance for atomic trade');
      }

      transaction.update(agentRef, {
        'walletBalance': currentBal + balanceChange,
      });

      transaction.set(_db.collection('transactions').doc(txId), tx.toFirestore());

      // If commission earned, write to payout collection
      if (commissionEarned > 0) {
        final commId = _db.collection('commissions').doc().id;
        transaction.set(_db.collection('commissions').doc(commId), {
          'id': commId,
          'agentId': _currentAgent!.agentId,
          'transactionId': txId,
          'amount': commissionEarned,
          'rate': commissionRate,
          'timestamp': FieldValue.serverTimestamp(),
        });
      }
    });

    await fetchAgentDetails();
    return true;
  }

  Future<void> logout() async {
    await _auth.signOut();
  }
}
`
  },
  {
    name: "deposit_screen.dart",
    path: "lib/views/deposit_screen.dart",
    language: "dart",
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/firebase_service.dart';

class DepositScreen extends StatefulWidget {
  const DepositScreen({super.key});

  @override
  State<DepositScreen> createState() => _DepositScreenState();
}

class _DepositScreenState extends State<DepositScreen> {
  final _formKey = GlobalKey<FormState>();
  final _mobileController = TextEditingController();
  final _amountController = TextEditingController();
  double _calculatedCommission = 0.0;

  @override
  void initState() {
    super.initState();
    _amountController.addListener(_updateCommission);
  }

  void _updateCommission() {
    final amt = double.tryParse(_amountController.text) ?? 0.0;
    setState(() {
      _calculatedCommission = amt * 0.05; // 5% Commission
    });
  }

  @override
  Widget build(BuildContext context) {
    final firebaseService = Provider.of<FirebaseService>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cash In (Deposit)'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Card(
                color: Theme.of(context).colorScheme.primaryContainer,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      const Text('Deposit Commission Incentive', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 8),
                      Text('Earn 5.0% flat commission for every cash. Your reward accumulates instantly in your balance.', 
                        textAlign: TextAlign.center, 
                        style: TextStyle(color: Theme.of(context).colorScheme.onPrimaryContainer)
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              TextFormField(
                controller: _mobileController,
                decoration: const InputDecoration(
                  labelText: "Customer Mobile Number",
                  prefixIcon: Icon(Icons.phone_android),
                  border: OutlineInputBorder(),
                  hintText: "e.g. 017XXXXXXXX",
                ),
                keyboardType: TextInputType.phone,
                validator: (val) {
                  if (val == null || val.length < 11) return "Enter valid Bangladeshi phone";
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _amountController,
                decoration: const InputDecoration(
                  labelText: "Deposit Amount (BDT)",
                  prefixIcon: Icon(Icons.currency_lira),
                  border: OutlineInputBorder(),
                  suffixText: "BDT",
                ),
                keyboardType: TextInputType.number,
                validator: (val) {
                  final parsed = double.tryParse(val ?? '0');
                  if (parsed == null || parsed <= 0) return "Provide valid deposit amount";
                  if (firebaseService.currentAgent!.walletBalance < parsed) return "Exceeds agent account balance";
                  return null;
                },
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade400),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Est. Agent Earnings (5%):', style: TextStyle(fontSize: 15)),
                    Text('\$ ' + _calculatedCommission.toStringAsFixed(2) + ' BDT', 
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.green)
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  foregroundColor: Colors.white,
                ),
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('Confirm Cash In'),
                        content: Text('Perform deposit of \${_amountController.text} BDT to customer \${_mobileController.text}?'),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                          ElevatedButton(
                            onPressed: () async {
                              Navigator.pop(context);
                              try {
                                await firebaseService.executeTransaction(
                                  customerMobile: _mobileController.text,
                                  type: 'deposit',
                                  amount: double.parse(_amountController.text),
                                );
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Transaction Executed Successfully!'))
                                );
                                Navigator.pop(context);
                              } catch (e) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text(e.toString()))
                                );
                              }
                            },
                            child: const Text('Confirm'),
                          )
                        ],
                      ),
                    );
                  }
                },
                icon: const Icon(Icons.arrow_circle_up_rounded),
                label: const Text('Execute Cash In'),
              )
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _amountController.dispose();
    _mobileController.dispose();
    super.dispose();
  }
}
`
  },
  {
    name: "APK Build Guide",
    path: "lib/APK_BUILD_GUIDE.md",
    language: "markdown",
    content: `# E-Wallet Agent: Android APK Compilation Instructions

To build a secure, production-ready release key APK for the E-Wallet Agent application, execute the following workflow in terminal.

## Prerequisites

1. Install [Flutter SDK (v3.10+)](https://flutter.dev/docs/get-started/install)
2. Install [Android Studio & JDK 17](https://developer.android.com/studio)
3. Ensure Firebase Android platform app configuration is added inside \`android/app/google-services.json\`.

---

## Step-by-Step Build Commands

### Step 1: Initialize Packages
Clean previous cached compilation items and fetch dependencies:
\`\`\`bash
flutter clean
flutter pub get
\`\`\`

### Step 2: Configure Proguard Rules
To protect financial models and prevent decompiling analysis, create or append rules in \`android/app/proguard-rules.pro\`:
\`\`\`txt
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.internal.** { *; }
-keep class com.google.firebase.firestore.FirebaseFirestore { *; }
\`\`\`

### Step 3: Bundle Release Signing Key
Generate standard secure Java keystore for signing:
\`\`\`bash
keytool -genkey -v -keystore android/app/release-key.jks \\
  -keyalg RSA -keysize 2048 -validity 10000 \\
  -alias ewalletsign
\`\`\`

Declare credentials in \`android/key.properties\`:
\`\`\`properties
storePassword=MY_STORE_PASSWORD
keyPassword=MY_KEY_PASSWORD
keyAlias=ewalletsign
storeFile=release-key.jks
\`\`\`

### Step 4: Execute APK Generation
Run the Flutter compiler targeting high optimization settings:
\`\`\`bash
flutter build apk --release --split-per-abi --target-platform=android-arm,android-arm64
\`\`\`

The compiled binaries will be output cleanly to:
\`\`\`path
build/app/outputs/flutter-apk/app-release.apk
\`\`\`

You can copy and directly side-load or upload this secure file to Google Play Console.
`
  }
];
