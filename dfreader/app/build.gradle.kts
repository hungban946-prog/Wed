plugins {
 id("com.android.application")
 id("org.jetbrains.kotlin.android")
}

android {
 namespace = "com.dark.dfreader"
 compileSdk = 34

 defaultConfig {
 applicationId = "com.dark.dfreader"
 minSdk = 24
 targetSdk = 34
 versionCode = 1
 versionName = "1.0"

 ndk {
 abiFilters += "arm64-v8a"
 }

 externalNativeBuild {
 cmake {
 cppFlags += "-std=c++17"
 }
 }
 }

 externalNativeBuild {
 cmake {
 path = file("CMakeLists.txt")
 version = "3.22.1"
 }
 }

 buildTypes {
 release {
 isMinifyEnabled = false
 }
 }

 compileOptions {
 sourceCompatibility = JavaVersion.VERSION_17
 targetCompatibility = JavaVersion.VERSION_17
 }

 kotlinOptions {
 jvmTarget = "17"
 }
}

dependencies {
 implementation("androidx.core:core-ktx:1.12.0")
 implementation("androidx.appcompat:appcompat:1.6.1")
 implementation("com.google.android.material:material:1.11.0")
}