package pkg

import (
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/base64"
	"fmt"
)

// Base64 文字列から ECDSA 秘密鍵をパース
func ImportPrivateKey(b64Str string) (*ecdsa.PrivateKey, error) {
	der, err := base64.StdEncoding.DecodeString(b64Str)
	if err != nil {
		return nil, err
	}

	// PKCS#8 形式の試行
	if key, err := x509.ParsePKCS8PrivateKey(der); err == nil {
		if ecKey, ok := key.(*ecdsa.PrivateKey); ok {
			return ecKey, nil
		}
	}

	// SEC 1 (EC) 形式の試行
	if ecKey, err := x509.ParseECPrivateKey(der); err == nil {
		return ecKey, nil
	}

	return nil, fmt.Errorf("failed to parse ECDSA private key")
}

// Base64 文字列から ECDSA 公開鍵をパース
func ImportPublicKey(b64Str string) (*ecdsa.PublicKey, error) {
	der, err := base64.StdEncoding.DecodeString(b64Str)
	if err != nil {
		return nil, err
	}

	pub, err := x509.ParsePKIXPublicKey(der)
	if err != nil {
		return nil, err
	}

	ecPub, ok := pub.(*ecdsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("not an ECDSA public key")
	}

	return ecPub, nil
}
