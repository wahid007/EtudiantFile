import java.io.*;
import java.util.Scanner;

public class TestEtudiant {

	public static void main(String[] args) {
		// Cr�ation d'un objet Scanner
		Scanner clavier = new Scanner(System.in);
		
		// lecture des param�tres
		System.out.print("Donner le nom : ");
		String pNom = clavier.nextLine();
		
		System.out.print("Donner le prenom : ");
		String pPrenom = clavier.nextLine();
		
		System.out.print("Donner l'annee naissance : ");
		int pAnneeNais = clavier.nextInt();
		
		// cr�ation de l'objet e1
		Etudiant e1 = new Etudiant(pNom, pPrenom, pAnneeNais);
		
		// affichage de e1
		System.out.println(e1);
		
		// 3- Sauvegarde de e1 dans le fichier base.bin
		try {
			File fichier = new File("base.bin");
			ObjectOutputStream flux = new ObjectOutputStream(     
					new FileOutputStream(fichier));
			flux.writeObject(e1);       
			flux.close();  
			System.out.println("Sauvegarde effectu� avec succes !");
		} catch (IOException ioe) {       
			System.err.println(ioe);     
		}   
		
		// 4-  lecture de l'objet � partir du fichier base.bin
		 try {         
			File fichier = new File("base.bin");
			ObjectInputStream flux = new ObjectInputStream(           
					 new FileInputStream(fichier));
		 
			Etudiant e2 = (Etudiant) flux.readObject();         
	        System.out.println(e2);         
	        flux.close();       
	     }       
		 catch (IOException ioe) {         
			 System.err.println(ioe);       
		 }      
		 catch (ClassNotFoundException cnfe) {         
			 System.err.println(cnfe);       
		 }

	}

}
